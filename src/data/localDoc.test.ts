import { describe, expect, it } from 'vitest'
import { withDefaults } from './localDoc'

describe('withDefaults', () => {
  const fallback = { a: 1, nested: { x: 1, y: 2 }, list: [1, 2], updatedAt: 0 }
  it('fills fields a stored copy does not have yet, also one level down', () => {
    expect(withDefaults(fallback, { a: 5, nested: { x: 9 } as never, updatedAt: 3 })).toEqual({ a: 5, nested: { x: 9, y: 2 }, list: [1, 2], updatedAt: 3 })
  })
  it('keeps stored lists as they are', () => {
    expect(withDefaults(fallback, { list: [] }).list).toEqual([])
  })
  it('uses the defaults when nothing is stored', () => {
    expect(withDefaults(fallback, undefined)).toBe(fallback)
  })
})
