import { describe, expect, it } from 'vitest'
import { WORDS } from '@/lessons/data'
import { newRound, nextIs, playable } from './builder'

describe('word builder', () => {
  it('builds the word in capitals from mixed-up letters', () => {
    const round = newRound({ emoji: 'animal-fox', word: 'fox' })
    expect(round.target).toBe('FOX')
    expect([...round.tiles].sort().join('')).toBe('FOX')
    expect(round.tiles.join('')).not.toBe('FOX')
  })

  it('accepts only the next right letter', () => {
    const round = newRound({ emoji: 'animal-owl', word: 'owl' })
    expect(nextIs(round, '', 'O')).toBe(true)
    expect(nextIs(round, 'O', 'L')).toBe(false)
    expect(nextIs(round, 'O', 'W')).toBe(true)
  })

  it('only uses short single words', () => {
    const words = playable(WORDS)
    expect(words.length).toBeGreaterThan(30)
    for (const w of words) expect(w.word).toMatch(/^[a-z]{1,8}$/)
  })
})
