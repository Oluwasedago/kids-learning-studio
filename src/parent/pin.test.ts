import { describe, expect, it } from 'vitest'
import { hashPin, makePin, newRecoveryCode, normalizeCode, pinMatches, RESET_WAIT_MS, resetReadyAt } from './pin'

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
  it('makes readable recovery codes and accepts them typed loosely', async () => {
    const code = newRecoveryCode()
    expect(code).toMatch(/^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/)
    expect(newRecoveryCode()).not.toBe(code)
    const stored = await makePin(normalizeCode(code))
    expect(await pinMatches(normalizeCode(` ${code.toLowerCase().replace(/-/g, ' ')} `), stored)).toBe(true)
    expect(await pinMatches(normalizeCode('AAAA-BBBB-CCCC'), stored)).toBe(false)
  })
  it('a reset without the code waits 24 hours', () => {
    expect(resetReadyAt(1000)).toBe(1000 + RESET_WAIT_MS)
    expect(RESET_WAIT_MS).toBe(86_400_000)
  })
})
