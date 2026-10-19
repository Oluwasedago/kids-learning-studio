import { describe, expect, it } from 'vitest'
import { EMPTY_USAGE } from '@/data/types'
import { addUsage, areaKind } from './usage'

describe('usage', () => {
  const day = new Date(2026, 9, 19, 10)
  it('adds seconds per area and counts earned time separately', () => {
    let u = addUsage(EMPTY_USAGE, day, 'game:snake', 15, true, 1)
    u = addUsage(u, day, 'game:snake', 15, true, 2)
    u = addUsage(u, day, 'mission:maths', 15, false, 3)
    expect(u.days['2026-10-19']).toEqual({ 'game:snake': 30, 'mission:maths': 15 })
    expect(u.earnedUsed['2026-10-19']).toBe(30)
  })
  it('forgets days older than 100 days', () => {
    const old = { ...EMPTY_USAGE, days: { '2026-01-01': { home: 60 } }, earnedUsed: { '2026-01-01': 60 } }
    const u = addUsage(old, day, 'home', 15, false)
    expect(u.days['2026-01-01']).toBeUndefined()
    expect(u.earnedUsed['2026-01-01']).toBeUndefined()
  })
  it('knows the kind of an area', () => {
    expect(areaKind('mission:maths')).toBe('mission')
    expect(areaKind('home')).toBe('home')
  })
})
