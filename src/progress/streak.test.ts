import { describe, expect, it } from 'vitest'
import { addDays, isoDate } from '@/shared/date'
import { computeStreak, milestoneAt } from './streak'

const today = new Date(2026, 9, 19, 10)
/** Stars on the days `offsets` before today (0 = today). */
const on = (...offsets: number[]) => Object.fromEntries(offsets.map((o) => [isoDate(addDays(today, -o)), 1]))

describe('learning streak', () => {
  it('counts learning days in a row; today without a star does not break it', () => {
    expect(computeStreak(on(1, 2, 3), today)).toMatchObject({ current: 3, learnedToday: false, atRisk: true })
    expect(computeStreak(on(0, 1, 2, 3), today)).toMatchObject({ current: 4, learnedToday: true, atRisk: false })
  })
  it('breaks after a missed day when no freeze is left, and keeps the longest', () => {
    const s = computeStreak(on(0, 1, 3, 4, 5, 6, 7), today)
    expect(s.current).toBe(2)
    expect(s.longest).toBe(5)
    expect(s.frozen.size).toBe(0)
  })
  it('a 7-day run earns a freeze that covers the next missed day', () => {
    // 7 days in a row (days 9..3 before today), missed day 2, learned yesterday and today.
    const s = computeStreak(on(0, 1, 3, 4, 5, 6, 7, 8, 9), today)
    expect(s.frozen.has(isoDate(addDays(today, -2)))).toBe(true)
    expect(s.current).toBe(9)
    expect(s.freezes).toBe(0)
  })
  it('keeps at most 2 freezes', () => {
    const many = on(...Array.from({ length: 30 }, (_, i) => i + 1))
    expect(computeStreak(many, today).freezes).toBe(2)
  })
  it('starts at zero without any stars', () => {
    expect(computeStreak({}, today)).toMatchObject({ current: 0, longest: 0, atRisk: false })
  })
  it('marks the milestones', () => {
    expect(milestoneAt(7)).toBe(7)
    expect(milestoneAt(8)).toBeNull()
  })
})
