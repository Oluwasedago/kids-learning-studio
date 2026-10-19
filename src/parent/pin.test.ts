import { describe, expect, it } from 'vitest'
import { hashPin, makePin, pinMatches } from './pin'

describe('parent PIN', () => {
  it('stores a salted hash and checks a PIN against it', async () => {
    const stored = await makePin('2468')
    expect(stored.hash).not.toContain('2468')
    expect(await pinMatches('2468', stored)).toBe(true)
    expect(await pinMatches('2469', stored)).toBe(false)
    expect(await pinMatches('2468', null)).toBe(false)
  })
  it('gives different hashes for different salts', async () => {
    expect(await hashPin('1234', 'a', 1000)).not.toBe(await hashPin('1234', 'b', 1000))
  })
})
