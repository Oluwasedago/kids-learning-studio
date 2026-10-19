import { describe, expect, it } from 'vitest'
import { starterAccess } from '@/access/access'
import { EMPTY_PROGRESS } from '@/data/types'
import { completeMission, levelOf, missionsFor, scoreOf, streak, weekStars } from './progress'

const day = new Date(2026, 9, 19, 10)
const access = starterAccess(7)

describe('progress', () => {
  it('missions: maths first, then other enabled subjects in turn', () => {
    const m = missionsFor(day, access, 3)
    expect(m).toHaveLength(3)
    expect(m[0]).toBe('maths')
    expect(new Set(m).size).toBe(3)
    expect(missionsFor(new Date(2026, 9, 20), access, 3)).not.toEqual(m)
  })
  it('missions only from enabled subjects', () => {
    const onlyEnglish = { ...access, maths: { enabled: false, unlocked: true }, world: { enabled: false, unlocked: true }, patterns: { enabled: false, unlocked: true } }
    expect(missionsFor(day, onlyEnglish, 3)).toEqual(['english'])
    expect(missionsFor(day, {}, 3)).toEqual([])
  })
  it('a day mission gives one star once; practice gives none but still moves the level', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    let p = completeMission(EMPTY_PROGRESS, 'maths', { right: 8, total: 8 }, opts)
    expect(p.stars['2026-10-19']).toBe(1)
    p = completeMission(p, 'maths', { right: 8, total: 8 }, opts)
    expect(p.stars['2026-10-19']).toBe(1)
    expect(levelOf(p, 'maths', 7)).toBe(levelOf(EMPTY_PROGRESS, 'maths', 7) + 1)
    const practice = completeMission(EMPTY_PROGRESS, 'world', { right: 2, total: 8 }, { ...opts, counts: false })
    expect(practice.stars['2026-10-19']).toBeUndefined()
    expect(scoreOf(practice, 'world', day)).toBeNull()
  })
  it('keeps the best score of the day', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    let p = completeMission(EMPTY_PROGRESS, 'english', { right: 5, total: 8 }, opts)
    p = completeMission(p, 'english', { right: 7, total: 8 }, opts)
    p = completeMission(p, 'english', { right: 6, total: 8 }, opts)
    expect(scoreOf(p, 'english', day)).toEqual({ right: 7, total: 8 })
  })
  it('counts the week and the streak', () => {
    const p = { ...EMPTY_PROGRESS, stars: { '2026-10-17': 2, '2026-10-18': 1, '2026-10-19': 3, '2026-10-12': 9 } }
    expect(weekStars(p, day)).toBe(3)
    expect(streak(p, day)).toBe(3)
    expect(streak({ ...p, stars: { ...p.stars, '2026-10-19': 0 } }, day)).toBe(2)
  })
})
