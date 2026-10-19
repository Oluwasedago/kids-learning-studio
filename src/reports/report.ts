import { SUBJECTS, type Subject } from '@/access/catalogue'
import type { Mistake, Progress, Score, Settings, Usage } from '@/data/types'
import type { Strings } from '@/i18n'
import { LADDERS, stageTags } from '@/lessons/ladder'
import { levelOf } from '@/progress/progress'
import { areaKind } from '@/progress/usage'
import { addDays, isoDate, mondayOf } from '@/shared/date'

// Reports for parents: a day, a week (Monday–Sunday) or a month, built from what is saved on the device.
// Sent by email through the parent's own mail app (a mailto: link), so nothing goes through a server.
// Pure functions (tested in report.test.ts).

export type Period = Settings['report']['period']

export interface SubjectReport {
  subject: Subject
  missions: number
  /** Share right at the first try over the period's best daily scores (0-1), or null without results. */
  accuracy: number | null
  /** The skill being practised now. */
  skill: string
  stage: string
}

/** A skill the child got wrong often in the period, with examples of their wrong answers. */
export interface HelpItem {
  subject: Subject
  step: string
  skill: string
  stage: string
  right: number
  total: number
  examples: Mistake[]
}

/** Skills answered right less often than this, with at least HELP_MIN_TRIES tries, show as "needs help". */
export const HELP_BELOW = 0.7
export const HELP_MIN_TRIES = 4

/** The subject and ladder step of a step id, or null for an unknown id. */
function findStep(id: string): { subject: Subject; skill: string; stage: number } | null {
  for (const subject of SUBJECTS) {
    const s = LADDERS[subject].find((x) => x.id === id)
    if (s) return { subject, skill: s.skill, stage: s.stage }
  }
  return null
}

export interface Report {
  period: Period
  from: string
  to: string
  activeDays: number
  stars: number
  missions: number
  minutes: { learning: number; games: number; other: number; earnedUsed: number }
  subjects: SubjectReport[]
  /** Weakest skills first. */
  needsHelp: HelpItem[]
  /** Wrong answers in the period, newest first (at most 10). */
  mistakes: Mistake[]
}

/** First and last day of the period containing `now` (week: Monday–Sunday). */
export function periodRange(period: Period, now: Date): { from: Date; to: Date } {
  if (period === 'day') return { from: now, to: now }
  if (period === 'week') {
    const from = mondayOf(now)
    return { from, to: addDays(from, 6) }
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) }
}

export function buildReport(progress: Progress, usage: Usage, period: Period, now: Date, age: number): Report {
  const { from, to } = periodRange(period, now)
  const first = isoDate(from)
  const last = isoDate(to)
  const inRange = (day: string) => day >= first && day <= last
  const sum = (rec: Record<string, number>) => Object.entries(rec).reduce((n, [day, v]) => (inRange(day) ? n + v : n), 0)

  const seconds = { learning: 0, games: 0, other: 0 }
  const active = new Set<string>()
  for (const [day, areas] of Object.entries(usage.days)) {
    if (!inRange(day)) continue
    for (const [area, s] of Object.entries(areas)) {
      const kind = areaKind(area)
      if (kind === 'mission') seconds.learning += s
      else if (kind === 'game') seconds.games += s
      else seconds.other += s
      if (s > 0) active.add(day)
    }
  }
  for (const [day, n] of Object.entries(progress.stars)) if (inRange(day) && n > 0) active.add(day)

  const subjects = SUBJECTS.map((subject): SubjectReport => {
    let missions = 0
    let right = 0
    let total = 0
    for (const [day, done] of Object.entries(progress.missions)) if (inRange(day) && done.includes(subject)) missions++
    for (const [day, scores] of Object.entries(progress.scores)) {
      const s = inRange(day) ? scores[subject] : undefined
      if (s) {
        right += s.right
        total += s.total
      }
    }
    const step = LADDERS[subject][Math.min(levelOf(progress, subject, age), LADDERS[subject].length - 1)]
    return { subject, missions, accuracy: total > 0 ? right / total : null, skill: step.skill, stage: stageTags(step.stage).cambridge }
  })

  // Skills that need help: answers per step over the period.
  const perStep = new Map<string, Score>()
  for (const [day, steps] of Object.entries(progress.attempts)) {
    if (!inRange(day)) continue
    for (const [step, s] of Object.entries(steps)) {
      const sum = perStep.get(step) ?? { right: 0, total: 0 }
      perStep.set(step, { right: sum.right + s.right, total: sum.total + s.total })
    }
  }
  const mistakes = progress.mistakes.filter((m) => inRange(m.day)).reverse()
  const needsHelp: HelpItem[] = []
  for (const [step, s] of perStep) {
    const info = findStep(step)
    if (!info || s.total < HELP_MIN_TRIES || s.right / s.total >= HELP_BELOW) continue
    needsHelp.push({ subject: info.subject, step, skill: info.skill, stage: stageTags(info.stage).cambridge, ...s, examples: mistakes.filter((m) => m.step === step).slice(0, 3) })
  }
  needsHelp.sort((a, b) => a.right / a.total - b.right / b.total)

  const minutes = (s: number) => Math.round(s / 60)
  return {
    period,
    from: first,
    to: last,
    activeDays: active.size,
    stars: sum(progress.stars),
    missions: Object.entries(progress.missions).reduce((n, [day, done]) => (inRange(day) ? n + done.length : n), 0),
    minutes: { learning: minutes(seconds.learning), games: minutes(seconds.games), other: minutes(seconds.other), earnedUsed: minutes(sum(usage.earnedUsed)) },
    subjects,
    needsHelp,
    mistakes: mistakes.slice(0, 10),
  }
}

/** The report as plain text for an email. */
export function reportText(r: Report, t: Strings, childName: string): string {
  const lines = [
    t.reports.emailTitle(childName, t.reports.periods[r.period], r.from === r.to ? r.from : `${r.from} – ${r.to}`),
    '',
    t.reports.activeDays(r.activeDays),
    t.reports.starsLine(r.stars, r.missions),
    t.reports.minutesLine(r.minutes.learning, r.minutes.games, r.minutes.earnedUsed),
    '',
    t.reports.bySubject,
    ...r.subjects.map((s) => `- ${t.items[s.subject]}: ${t.reports.subjectLine(s.missions, s.accuracy === null ? null : Math.round(s.accuracy * 100), s.skill, s.stage)}`),
    '',
    r.needsHelp.length === 0 ? t.reports.noHelpNeeded : t.reports.needsHelp,
    ...r.needsHelp.flatMap((h) => [
      `- ${t.items[h.subject]}: ${h.skill} (${t.reports.rightOf(h.right, h.total)})`,
      ...h.examples.map((m) => `    ${t.reports.mistakeLine(m.prompt, m.given, m.answer)}`),
    ]),
    '',
    t.reports.footer,
  ]
  return lines.join('\n')
}

/** A mailto: link that opens the parent's own mail app with the report filled in. */
export function mailtoUrl(to: string, subject: string, body: string): string {
  // The @ stays as it is: some mail apps do not decode %40 in the address.
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
