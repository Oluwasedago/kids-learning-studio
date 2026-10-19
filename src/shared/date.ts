// Dates in local time. Days are stored as "YYYY-MM-DD" strings, which sort in date order.

/** "2026-10-19" for a date in local time. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The same time of day, `n` days later (or earlier with a negative n). */
export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

/** Days since 1 Jan 1970 counted in local time (changes at local midnight). */
export const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000)

/** Monday of the week containing `d` (00:00). */
export function mondayOf(d: Date): Date {
  const m = addDays(d, -((d.getDay() + 6) % 7))
  m.setHours(0, 0, 0, 0)
  return m
}

/**
 * Age in whole years from a birth month and year only (no day is stored, on purpose). In the birth month itself
 * the child counts as having had the birthday: off by at most a few weeks, which is fine for choosing lessons.
 */
export function ageFrom(birthMonth: number, birthYear: number, now: Date): number {
  const months = (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth)
  return Math.max(0, Math.floor(months / 12))
}

/** Whole days from `from` to `to` (local dates; negative when `to` is earlier). */
export const daysBetween = (from: Date, to: Date) => dayNumber(to) - dayNumber(from)

/** Days until the next time a month and day come round (0 = today; 29 Feb waits for a leap year). */
export function daysUntilDate(month: number, day: number, now: Date): number {
  for (let i = 0; i < 1462; i++) {
    const d = addDays(now, i)
    if (d.getMonth() + 1 === month && d.getDate() === day) return i
  }
  return Infinity
}
