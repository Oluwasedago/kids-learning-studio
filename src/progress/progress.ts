import { type ItemId, SUBJECTS, type Subject } from '@/access/catalogue'
import type { AccessRule, Progress, Score } from '@/data/types'
import { adapt, LADDERS, startLevel } from '@/lessons/ladder'
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

/** Days in a row with at least one star, up to today (today without a star yet does not break it). */
export function streak(p: Progress, today: Date): number {
  let day = starsOn(p, today) > 0 ? today : addDays(today, -1)
  let count = 0
  for (let i = 0; i < 1000 && starsOn(p, day) > 0; i++, day = addDays(day, -1)) count++
  return count
}

/** The child's current step on a subject's ladder (the start step for their age when not set yet). */
export const levelOf = (p: Progress, subject: Subject, age: number) => p.levels[subject] ?? startLevel(subject, age)

/**
 * A finished mission round. Counts for the adaptive level every time (practice too). When it is one of the
 * day's missions and not yet done today: ticked off and one star. The day's best score is kept.
 */
export function completeMission(p: Progress, subject: Subject, score: Score, opts: { day: Date; age: number; counts: boolean; now?: number }): Progress {
  const now = opts.now ?? Date.now()
  const date = isoDate(opts.day)
  const share = score.total > 0 ? score.right / score.total : 0
  const level = levelOf(p, subject, opts.age)
  const next = adapt(level, p.recent[subject] ?? [], share, LADDERS[subject].length - 1)
  const old = p.scores[date]?.[subject]
  const better = !old || share > old.right / old.total
  const out: Progress = {
    ...p,
    levels: { ...p.levels, [subject]: next.level },
    recent: { ...p.recent, [subject]: next.recent },
    scores: better ? { ...p.scores, [date]: { ...p.scores[date], [subject]: score } } : p.scores,
    updatedAt: now,
  }
  const done = p.missions[date] ?? []
  if (!opts.counts || done.includes(subject)) return out
  return { ...out, missions: { ...p.missions, [date]: [...done, subject] }, stars: { ...p.stars, [date]: (p.stars[date] ?? 0) + 1 } }
}

/** Score of a subject's mission today, or null when not done yet. */
export function scoreOf(p: Progress, subject: string, d: Date): Score | null {
  const date = isoDate(d)
  if (!(p.missions[date] ?? []).includes(subject)) return null
  return p.scores[date]?.[subject] ?? { right: 1, total: 1 }
}
