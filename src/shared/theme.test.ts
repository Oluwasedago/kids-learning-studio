import { describe, expect, it } from 'vitest'
import { isDark } from './theme'

describe('theme', () => {
  it('System follows the device, Light and Dark are fixed', () => {
    expect(isDark('system', true)).toBe(true)
    expect(isDark('system', false)).toBe(false)
    expect(isDark('light', true)).toBe(false)
    expect(isDark('dark', false)).toBe(true)
  })
})
