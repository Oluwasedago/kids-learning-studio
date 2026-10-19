import { describe, expect, it } from 'vitest'
import { WORDS } from '@/lessons/data'
import { isMatch, newBoard } from './memory'

describe('memory', () => {
  it('lays out every pair twice, one word card per pair in words mode', () => {
    const board = newBoard(WORDS, 8, 'words')
    expect(board).toHaveLength(16)
    for (let p = 0; p < 8; p++) {
      const cards = board.filter((c) => c.pair === p)
      expect(cards).toHaveLength(2)
      expect(isMatch(cards[0], cards[1])).toBe(true)
      expect(cards.filter((c) => c.text).length).toBe(1)
    }
    expect(newBoard(WORDS, 6, 'pictures').every((c) => !c.text)).toBe(true)
  })

  it('a card is no match for itself or another pair', () => {
    const [a, b] = newBoard(WORDS, 6, 'words')
    expect(isMatch(a, a)).toBe(false)
    if (a.pair !== b.pair) expect(isMatch(a, b)).toBe(false)
  })
})
