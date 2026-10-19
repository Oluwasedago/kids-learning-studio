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
  const answers = (right: number, total = 8, step = 'add-10') =>
    Array.from({ length: total }, (_, i) => ({ step, prompt: `Q${i}`, given: i < right ? 'ok' : 'no', answer: 'ok', right: i < right }))

  it('a passed day mission gives one star once; practice gives none but still moves the level', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    let p = completeMission(EMPTY_PROGRESS, 'maths', answers(8), opts)
    expect(p.stars['2026-10-19']).toBe(1)
    p = completeMission(p, 'maths', answers(8), opts)
    expect(p.stars['2026-10-19']).toBe(1)
    expect(levelOf(p, 'maths', 7)).toBe(levelOf(EMPTY_PROGRESS, 'maths', 7) + 1)
    const practice = completeMission(EMPTY_PROGRESS, 'world', answers(8), { ...opts, counts: false })
    expect(practice.stars['2026-10-19']).toBeUndefined()
    expect(scoreOf(practice, 'world', day)).toBeNull()
  })
  it('a failed mission (fewer than 5 of 8) gives no star and stays open', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    const p = completeMission(EMPTY_PROGRESS, 'maths', answers(4), opts)
    expect(p.stars['2026-10-19']).toBeUndefined()
    expect(p.missions['2026-10-19']).toBeUndefined()
    expect(p.scores['2026-10-19'].maths).toEqual({ right: 4, total: 8 })
    expect(completeMission(EMPTY_PROGRESS, 'maths', answers(5), opts).stars['2026-10-19']).toBe(1)
  })
  it('counts every answer per skill and keeps the wrong ones for parents', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    let p = completeMission(EMPTY_PROGRESS, 'maths', answers(6), opts)
    p = completeMission(p, 'maths', answers(3), opts)
    expect(p.attempts['2026-10-19']['add-10']).toEqual({ right: 9, total: 16 })
    expect(p.mistakes).toHaveLength(7)
    expect(p.mistakes[0]).toMatchObject({ day: '2026-10-19', subject: 'maths', step: 'add-10', given: 'no', answer: 'ok' })
  })
  it('keeps the best score of the day', () => {
    const opts = { day, age: 7, counts: true, now: 1 }
    let p = completeMission(EMPTY_PROGRESS, 'english', answers(5), opts)
    p = completeMission(p, 'english', answers(7), opts)
    p = completeMission(p, 'english', answers(6), opts)
    expect(scoreOf(p, 'english', day)).toEqual({ right: 7, total: 8 })
  })
  it('counts the week and the streak', () => {
    const p = { ...EMPTY_PROGRESS, stars: { '2026-10-17': 2, '2026-10-18': 1, '2026-10-19': 3, '2026-10-12': 9 } }
    expect(weekStars(p, day)).toBe(3)
    expect(streak(p, day)).toBe(3)
    expect(streak({ ...p, stars: { ...p.stars, '2026-10-19': 0 } }, day)).toBe(2)
  })
})
