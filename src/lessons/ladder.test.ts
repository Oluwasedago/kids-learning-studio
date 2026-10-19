import { describe, expect, it } from 'vitest'
import { SUBJECTS } from '@/access/catalogue'
import { misspellings } from './english'
import { adapt, LADDERS, makeRound, stageTags, startLevel } from './ladder'
import { seeded } from './question'

describe('skills ladder', () => {
  it('every ladder goes up in stage order', () => {
    for (const s of SUBJECTS) {
      const stages = LADDERS[s].map((x) => x.stage)
      expect(stages).toEqual([...stages].sort((a, b) => a - b))
    }
  })

  it('every step makes valid questions: an answer among the choices, all choices different', () => {
    for (const s of SUBJECTS) {
      for (const [level, step] of LADDERS[s].entries()) {
        const r = seeded(level + 1)
        for (let i = 0; i < 40; i++) {
          const q = step.make(r)
          expect(q.answer, `${s}/${step.id}`).toBeGreaterThanOrEqual(0)
          expect(q.answer, `${s}/${step.id}`).toBeLessThan(q.choices.length)
          expect(q.choices.length, `${s}/${step.id}`).toBeGreaterThanOrEqual(2)
          const keys = q.choices.map((c) => JSON.stringify(c))
          expect(new Set(keys).size, `${s}/${step.id}: ${keys.join(' | ')}`).toBe(keys.length)
          for (const c of q.choices) if (c.label !== undefined && /^-?\d+$/.test(c.label)) expect(Number(c.label)).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('tags stages with Cambridge, US and Berlin equivalents', () => {
    expect(stageTags(0)).toEqual({ cambridge: 'Early years', us: 'Pre-K', berlin: 'Kita / Vorschule' })
    expect(stageTags(3)).toEqual({ cambridge: 'Stage 3', us: 'Grade 2', berlin: 'Klasse 2' })
  })

  it('starts a little below the age, never past the top', () => {
    expect(LADDERS.maths[startLevel('maths', 4)].stage).toBe(0)
    expect(LADDERS.maths[startLevel('maths', 7)].stage).toBe(2)
    expect(startLevel('world', 30)).toBe(LADDERS.world.length - 1)
  })

  it('adapts: up after two strong rounds, down after a weak one', () => {
    expect(adapt(3, [], 1, 10)).toEqual({ level: 3, recent: [1] })
    expect(adapt(3, [1], 0.875, 10)).toEqual({ level: 4, recent: [] })
    expect(adapt(3, [1], 0.75, 10)).toEqual({ level: 3, recent: [1, 0.75] })
    expect(adapt(3, [1], 0.5, 10)).toEqual({ level: 2, recent: [] })
    expect(adapt(0, [], 0.25, 10)).toEqual({ level: 0, recent: [0.25] })
    expect(adapt(10, [1], 1, 10)).toEqual({ level: 10, recent: [1, 1] })
  })

  it('a round has 8 different questions', () => {
    const round = makeRound('maths', 5, seeded(7))
    expect(round).toHaveLength(8)
    expect(new Set(round.map((q) => q.prompt)).size).toBe(8)
  })

  it('misspellings differ from the word and from each other', () => {
    const r = seeded(3)
    for (const w of ['apple', 'giraffe', 'fox', 'kiwi']) {
      const m = misspellings(w, r)
      expect(m).toHaveLength(2)
      expect(m).not.toContain(w)
      expect(new Set(m).size).toBe(2)
    }
  })
})
