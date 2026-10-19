import { describe, expect, it } from 'vitest'
import { newPuzzle, solved, swap, tilePosition } from './puzzle'

describe('puzzle', () => {
  it('starts mixed up with every tile once', () => {
    for (let i = 0; i < 20; i++) {
      const order = newPuzzle(3)
      expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
      expect(solved(order)).toBe(false)
    }
  })

  it('is solved when every tile is back in place', () => {
    expect(solved(swap([1, 0, 2, 3], 0, 1))).toBe(true)
  })

  it('places each tile of the picture', () => {
    expect(tilePosition(0, 3)).toBe('0% 0%')
    expect(tilePosition(8, 3)).toBe('100% 100%')
    expect(tilePosition(5, 3)).toBe('100% 50%')
  })
})
