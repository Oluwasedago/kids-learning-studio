import { describe, expect, it } from 'vitest'
import { EMPTY_PROGRESS, EMPTY_USAGE } from '@/data/types'
import { en } from '@/i18n/en'
import { buildReport, mailtoUrl, periodRange, reportText } from './report'

const now = new Date(2026, 9, 21, 12) // Wednesday
const progress = {
  ...EMPTY_PROGRESS,
  stars: { '2026-10-19': 3, '2026-10-20': 2, '2026-10-12': 5 },
  missions: { '2026-10-19': ['maths', 'english', 'world'], '2026-10-20': ['maths', 'patterns'] },
  scores: { '2026-10-19': { maths: { right: 8, total: 8 }, english: { right: 4, total: 8 } }, '2026-10-20': { maths: { right: 6, total: 8 } } },
}
const usage = {
  ...EMPTY_USAGE,
  days: { '2026-10-19': { 'mission:maths': 300, 'game:snake': 600, home: 120 }, '2026-10-21': { 'game:memory': 60 } },
  earnedUsed: { '2026-10-19': 600, '2026-10-21': 60 },
}

describe('reports', () => {
  it('finds the period: day, Monday–Sunday week, calendar month', () => {
    const w = periodRange('week', now)
    expect([w.from.getDate(), w.to.getDate()]).toEqual([19, 25])
    const m = periodRange('month', now)
    expect([m.from.getDate(), m.to.getDate()]).toEqual([1, 31])
    expect(periodRange('day', now)).toEqual({ from: now, to: now })
  })

  it('sums the week: active days, stars, missions, minutes, accuracy per subject', () => {
    const r = buildReport(progress, usage, 'week', now, 7)
    expect(r.activeDays).toBe(3)
    expect(r.stars).toBe(5)
    expect(r.missions).toBe(5)
    expect(r.minutes).toEqual({ learning: 5, games: 11, other: 2, earnedUsed: 11 })
    const maths = r.subjects.find((s) => s.subject === 'maths')!
    expect(maths.missions).toBe(2)
    expect(maths.accuracy).toBeCloseTo(14 / 16)
    expect(r.subjects.find((s) => s.subject === 'patterns')!.accuracy).toBeNull()
  })

  it('writes plain text and a mailto link', () => {
    const text = reportText(buildReport(progress, usage, 'week', now, 7), en, 'Sam')
    expect(text).toContain('Sam')
    expect(text).toContain('Maths')
    const url = mailtoUrl('parent@example.com', 'Report', 'Line 1\nLine 2 & more')
    expect(url).toBe('mailto:parent@example.com?subject=Report&body=Line%201%0ALine%202%20%26%20more')
  })
})
