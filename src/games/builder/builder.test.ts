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

  it('only uses single words of up to 12 letters', () => {
    const words = playable(WORDS)
    expect(words.length).toBeGreaterThan(30)
    for (const w of words) expect(w.word).toMatch(/^[a-z]{1,12}$/)
  })
})

describe('word builder adapts', () => {
  it('grows after three clean rounds and shrinks after a hard one', async () => {
    const { nextLength } = await import('./builder')
    expect(nextLength(5, 2, 0)).toEqual({ length: 6, cleanRun: 0 })
    expect(nextLength(5, 1, 0)).toEqual({ length: 5, cleanRun: 2 })
    expect(nextLength(5, 2, 3)).toEqual({ length: 4, cleanRun: 0 })
    expect(nextLength(3, 0, 5).length).toBe(3)
  })

  it('picks words of about the wanted length, and adds letters that do not belong to long words', async () => {
    const { decoysFor, newRound, pickWord, playable } = await import('./builder')
    const { WORDS } = await import('@/lessons/data')
    for (let i = 0; i < 30; i++) expect(pickWord(playable(WORDS), 5).word.length).toBeLessThanOrEqual(5)
    const round = newRound({ emoji: 'fruit-watermelon', word: 'watermelon' }, Math.random, decoysFor(10))
    expect(round.tiles).toHaveLength(12)
  })
})
