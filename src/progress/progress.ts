import { type ItemId, SUBJECTS, type Subject } from '@/access/catalogue'
import { type AccessRule, MAX_MISTAKES, type Mistake, type Progress, type Score } from '@/data/types'
import { adapt, clampLevel, LADDERS, levelRange, passMark, starsFor, startLevel } from '@/lessons/ladder'
import { addDays, dayNumber, isoDate, mondayOf } from '@/shared/date'

// Missions, stars and levels. Pure functions (tested in progress.test.ts).

/**
 * The day's missions: maths first (when enabled), then the other enabled subjects in turn, so every subject
 * comes up several times a week. `count` from the parent settings (1-4).
 */
export function missionsFor(d: Date, access: Partial<Record<ItemId, AccessRule>>, count: number): Subject[] {
  const enabled = SUBJECTS.filter((s) => access[s]?.enabled)
  if (enabled.length === 0) return []
  const rest = enabled.filter((s) => s !== 'maths')
  const n = dayNumber(d)
  const rotated = rest.map((_, i) => rest[(n + i) % rest.length])
  return [...(enabled.includes('maths') ? ['maths' as const] : []), ...rotated].slice(0, Math.max(1, Math.min(count, enabled.length)))
}

export const starsOn = (p: Progress, d: Date) => p.stars[isoDate(d)] ?? 0

/** Stars from Monday to Sunday of the week containing `d`. */
export function weekStars(p: Progress, d: Date): number {
  const monday = mondayOf(d)
  let sum = 0
  for (let i = 0; i < 7; i++) sum += starsOn(p, addDays(monday, i))
  return sum
}

/**
 * The child's current step on a subject's ladder (the start step for their class when not set yet), always inside
 * the range of the class: a parent's new class counts at once, not only after a round.
 */
export const levelOf = (p: Progress, subject: Subject, stage: number) => clampLevel(subject, stage, p.levels[subject] ?? startLevel(subject, stage))

/** One answered question of a round. */
export interface Answer {
  step: string
  prompt: string
  given: string
  answer: string
  right: boolean
}

/**
 * A finished mission round (one try per question). Every answer is counted per skill step, and wrong ones are
 * kept for the parents. The result moves the adaptive level every time (practice too). The mission is ticked
 * off only when it is passed (passMark) and is one of the day's missions not yet done; it then gives one star
 * per 10 questions (starsFor), so a longer mission earns more time.
 */
export function completeMission(p: Progress, subject: Subject, answers: Answer[], opts: { day: Date; stage: number; counts: boolean; now?: number }): Progress {
  const now = opts.now ?? Date.now()
  const date = isoDate(opts.day)
  const score: Score = { right: answers.filter((a) => a.right).length, total: answers.length }
  const share = score.total > 0 ? score.right / score.total : 0
  const level = levelOf(p, subject, opts.stage)
  // The level moves with the results, but stays within a stage of the class (levelRange).
  const range = levelRange(subject, opts.stage)
  const moved = adapt(level, p.recent[subject] ?? [], share, LADDERS[subject].length - 1)
  const next = { level: Math.max(range.min, Math.min(range.max, moved.level)), recent: moved.recent }
  const old = p.scores[date]?.[subject]
  const better = !old || share > old.right / old.total

  const dayAttempts = { ...p.attempts[date] }
  for (const a of answers) {
    const s = dayAttempts[a.step] ?? { right: 0, total: 0 }
    dayAttempts[a.step] = { right: s.right + (a.right ? 1 : 0), total: s.total + 1 }
  }
  const mistakes: Mistake[] = [
    ...p.mistakes,
    ...answers.filter((a) => !a.right).map((a) => ({ day: date, subject, step: a.step, prompt: a.prompt, given: a.given, answer: a.answer })),
  ].slice(-MAX_MISTAKES)

  const out: Progress = {
    ...p,
    levels: { ...p.levels, [subject]: next.level },
    recent: { ...p.recent, [subject]: next.recent },
    scores: better ? { ...p.scores, [date]: { ...p.scores[date], [subject]: score } } : p.scores,
    attempts: { ...p.attempts, [date]: dayAttempts },
    mistakes,
    updatedAt: now,
  }
  const done = p.missions[date] ?? []
  if (!opts.counts || done.includes(subject) || score.right < passMark(score.total)) return out
  return { ...out, missions: { ...p.missions, [date]: [...done, subject] }, stars: { ...p.stars, [date]: (p.stars[date] ?? 0) + starsFor(score.total) } }
}

/** Score of a subject's mission today, or null when not done yet. */
export function scoreOf(p: Progress, subject: string, d: Date): Score | null {
  const date = isoDate(d)
  if (!(p.missions[date] ?? []).includes(subject)) return null
  return p.scores[date]?.[subject] ?? { right: 1, total: 1 }
}
