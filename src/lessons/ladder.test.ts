import { describe, expect, it } from 'vitest'
import { SUBJECTS } from '@/access/catalogue'
import { misspellings } from './english'
import { classLabel, classesOf } from './classes'
import { adapt, clampLevel, LADDERS, levelRange, makeRound, passMark, stageTags, starsFor, startLevel } from './ladder'
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
          const q = step.make(r, 'en')
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

  it('starts at the class stage, never past the top', () => {
    expect(LADDERS.maths[startLevel('maths', 0)].stage).toBe(0)
    expect(LADDERS.maths[startLevel('maths', 3)].stage).toBe(3)
    expect(startLevel('world', 6)).toBe(LADDERS.world.length - 1)
  })

  it('keeps the level within a stage of the class: one below to one above', () => {
    for (const s of SUBJECTS)
      for (let stage = 0; stage <= 6; stage++) {
        const { min, max } = levelRange(s, stage)
        const start = startLevel(s, stage)
        expect(min <= start && start <= max, `${s} stage ${stage}`).toBe(true)
        expect(LADDERS[s][max].stage, `${s} stage ${stage}`).toBeLessThanOrEqual(Math.max(stage + 1, LADDERS[s][start].stage))
        expect(LADDERS[s][min].stage, `${s} stage ${stage}`).toBeGreaterThanOrEqual(Math.min(stage - 1, LADDERS[s][start].stage))
      }
  })

  it('names classes in each school system', () => {
    expect(classLabel('germany', 2)).toBe('Klasse 1')
    expect(classLabel('us', 1)).toBe('Kindergarten')
    expect(classLabel('england', 3)).toBe('Year 3')
    expect(classLabel('nigeria', 6)).toBe('Primary 6')
    for (const sys of ['cambridge', 'england', 'us', 'germany', 'nigeria'] as const) expect(classesOf(sys).map((c) => c.stage)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('adapts: up after one very strong or two strong rounds, down after a weak one', () => {
    expect(adapt(3, [], 1, 10)).toEqual({ level: 4, recent: [] })
    expect(adapt(3, [], 0.8, 10)).toEqual({ level: 3, recent: [0.8] })
    expect(adapt(3, [0.8], 0.85, 10)).toEqual({ level: 4, recent: [] })
    expect(adapt(3, [0.8], 0.7, 10)).toEqual({ level: 3, recent: [0.8, 0.7] })
    expect(adapt(3, [1], 0.4, 10)).toEqual({ level: 2, recent: [] })
    expect(adapt(0, [], 0.25, 10)).toEqual({ level: 0, recent: [0.25] })
    expect(adapt(10, [1], 1, 10)).toEqual({ level: 10, recent: [1, 1] })
  })

  it('a new class moves a saved level into its range at once (Stage 6 never asks "before 7")', () => {
    const low = 2 // "numbers to 20: before and after", saved when the class was lower
    expect(LADDERS.maths[clampLevel('maths', 6, low)].stage).toBeGreaterThanOrEqual(6)
    expect(clampLevel('maths', 3, 0)).toBe(levelRange('maths', 3).min)
  })

  it('a round has 10 different questions (shuffled buttons do not make a question new)', () => {
    const round = makeRound('maths', 5, seeded(7))
    expect(round).toHaveLength(10)
    expect(new Set(round.map((q) => q.prompt)).size).toBe(10)
    for (const s of SUBJECTS)
      for (const level of LADDERS[s].keys()) {
        const r = makeRound(s, level, seeded(50 + level), 10, 'de')
        const keys = r.map((q) => JSON.stringify([q.prompt, q.visual, q.choices[q.answer]]))
        expect(new Set(keys).size, s + ' level ' + level).toBe(keys.length)
      }
  })

  it('every step can make a full 50-question round, never the same question twice in a row', () => {
    for (const s of SUBJECTS)
      for (const level of LADDERS[s].keys()) {
        const round = makeRound(s, level, seeded(level + 3), 50)
        expect(round, `${s} level ${level}`).toHaveLength(50)
        const keys = round.map((q) => JSON.stringify([q.prompt, q.visual, q.choices[q.answer]]))
        expect(keys.some((k, i) => i > 0 && k === keys[i - 1]), `${s} level ${level}`).toBe(false)
      }
  })

  it('pass marks and stars: 7 of 10, 18 of 25, 35 of 50', () => {
    expect([10, 25, 50].map(passMark)).toEqual([7, 18, 35])
    expect([10, 25, 50].map(starsFor)).toEqual([1, 3, 5])
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

  it('puts the right answer in every position, so children cannot learn where it is', () => {
    for (const s of SUBJECTS) {
      for (const [level, step] of LADDERS[s].entries()) {
        const r = seeded(100 + level)
        const seen = new Set<number>()
        let choices = 0
        for (let i = 0; i < 200; i++) {
          const q = step.make(r, 'en')
          seen.add(q.answer)
          choices = q.choices.length
        }
        expect(seen.size, `${s}/${step.id}`).toBe(choices)
      }
    }
  })
})
