import { addDays, isoDate } from '@/shared/date'

// The learning streak, like Duolingo's: days in a row with at least one passed mission (a star).
// Streak freezes are earned, not bought: every 7 days in a row earns one (at most 2 kept). A missed day uses a
// freeze automatically, so the streak survives; the frozen day itself does not add to the count.
// Worked out from the stars already saved, so there is nothing extra to store. Pure (tested in streak.test.ts).

export const FREEZE_EVERY = 7
export const MAX_FREEZES = 2
export const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365]

export interface Streak {
  /** Learning days in a row up to today (today counts once it has a star; without one it does not break). */
  current: number
  longest: number
  /** Freezes ready to protect a missed day. */
  freezes: number
  /** Days covered by a freeze ("YYYY-MM-DD"). */
  frozen: Set<string>
  learnedToday: boolean
  /** A streak is running but today has no star yet. */
  atRisk: boolean
}

export function computeStreak(stars: Record<string, number>, today: Date): Streak {
  const learned = (d: string) => (stars[d] ?? 0) > 0
  const days = Object.keys(stars).filter(learned).sort()
  const todayIso = isoDate(today)
  const frozen = new Set<string>()
  let current = 0
  let longest = 0
  let freezes = 0
  if (days.length > 0) {
    // Walk from the first learning day up to yesterday; today is looked at last.
    const first = new Date(`${days[0]}T12:00:00`)
    for (let d = first; isoDate(d) < todayIso; d = addDays(d, 1)) {
      const day = isoDate(d)
      if (learned(day)) {
        current++
        if (current % FREEZE_EVERY === 0 && freezes < MAX_FREEZES) freezes++
      } else if (current > 0 && freezes > 0) {
        freezes--
        frozen.add(day)
      } else {
        current = 0
      }
      longest = Math.max(longest, current)
    }
  }
  const learnedToday = learned(todayIso)
  if (learnedToday) {
    current++
    if (current % FREEZE_EVERY === 0 && freezes < MAX_FREEZES) freezes++
    longest = Math.max(longest, current)
  }
  return { current, longest, freezes, frozen, learnedToday, atRisk: current > 0 && !learnedToday }
}

/** The milestone reached exactly now (e.g. 7), or null. */
export const milestoneAt = (n: number) => (MILESTONES.includes(n) ? n : null)
