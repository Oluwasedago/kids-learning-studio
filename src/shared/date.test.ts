import { describe, expect, it } from 'vitest'
import { addDays, ageFrom, daysBetween, isoDate, mondayOf } from './date'

describe('dates', () => {
  it('writes local dates as YYYY-MM-DD and moves by days', () => {
    const d = new Date(2026, 9, 19, 9, 15)
    expect(isoDate(d)).toBe('2026-10-19')
    expect(isoDate(addDays(d, 13))).toBe('2026-11-01')
    expect(isoDate(addDays(d, -19))).toBe('2026-09-30')
  })
  it('finds the Monday of a week', () => {
    expect(isoDate(mondayOf(new Date(2026, 9, 25)))).toBe('2026-10-19') // Sunday
    expect(isoDate(mondayOf(new Date(2026, 9, 19)))).toBe('2026-10-19') // Monday
  })
  it('counts age from birth month and year only', () => {
    const now = new Date(2026, 9, 19)
    expect(ageFrom(10, 2019, now)).toBe(7) // birthday month: counts as had
    expect(ageFrom(11, 2019, now)).toBe(6)
    expect(ageFrom(1, 2020, now)).toBe(6)
  })
  it('counts days between dates', () => {
    expect(daysBetween(new Date(2026, 9, 1), new Date(2026, 9, 19))).toBe(18)
  })
})
