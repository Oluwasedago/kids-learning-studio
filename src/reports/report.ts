import { SUBJECTS, type Subject } from '@/access/catalogue'
import type { Progress, Settings, Usage } from '@/data/types'
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

export interface Report {
  period: Period
  from: string
  to: string
  activeDays: number
  stars: number
  missions: number
  minutes: { learning: number; games: number; other: number; earnedUsed: number }
  subjects: SubjectReport[]
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
    t.reports.footer,
  ]
  return lines.join('\n')
}

/** A mailto: link that opens the parent's own mail app with the report filled in. */
export function mailtoUrl(to: string, subject: string, body: string): string {
  // The @ stays as it is: some mail apps do not decode %40 in the address.
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
