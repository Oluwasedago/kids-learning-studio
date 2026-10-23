import { describe, expect, it } from 'vitest'
import { seeded } from '@/lessons/question'
import { MESSAGES, makePuzzle, nextCell, SYMBOLS } from './code'

describe('code breaker', () => {
  it('every message uses only the 26 letters and spaces, and fits on a tablet', () => {
    for (const list of Object.values(MESSAGES))
      for (const m of list) {
        expect(m, m).toMatch(/^[a-z ]+$/)
        expect(m.length, m).toBeLessThanOrEqual(26)
      }
  })
  it('decoding with the key gives the message back, in both codes', () => {
    const r = seeded(4)
    for (const mode of ['pictures', 'numbers'] as const)
      for (const m of MESSAGES.en) {
        const p = makePuzzle(m, mode, r)
        const letterOf = new Map(p.key.map((k) => [k.code, k.letter]))
        expect(p.cells.map((c) => (c.code === null ? c.char : letterOf.get(c.code))).join('')).toBe(m.toUpperCase())
        // Every letter of the message is on the keyboard, and no code means two letters.
        for (const c of p.cells) if (c.code) expect(p.keyboard).toContain(c.char)
        expect(new Set(p.key.map((k) => k.code)).size).toBe(p.key.length)
      }
  })
  it('picture codes change every round; the number code is always A = 1 … Z = 26', () => {
    const a = makePuzzle('well done', 'pictures', seeded(1))
    const b = makePuzzle('well done', 'pictures', seeded(2))
    expect(a.cells.map((c) => c.code)).not.toEqual(b.cells.map((c) => c.code))
    expect(makePuzzle('abc z', 'numbers', seeded(1)).cells.map((c) => c.code)).toEqual(['1', '2', '3', null, '26'])
    expect(SYMBOLS.length).toBeGreaterThanOrEqual(26)
    const files = new Set(Object.keys(import.meta.glob('/public/emoji/*.png')).map((f) => f.slice('/public/emoji/'.length, -4)))
    expect(SYMBOLS.filter((s) => !files.has(s))).toEqual([])
    expect(new Set(SYMBOLS).size).toBe(SYMBOLS.length)
  })
  it('skips spaces when finding the next letter', () => {
    const p = makePuzzle('be kind', 'numbers', seeded(3))
    expect(nextCell(p, 2)).toBe(3)
    expect(nextCell(p, 7)).toBe(-1)
  })
})
