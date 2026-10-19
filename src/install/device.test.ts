import { describe, expect, it } from 'vitest'
import { detectDevice } from './device'

describe('device detection', () => {
  it('recognises Fire tablets by Silk or the model code', () => {
    expect(detectDevice('Mozilla/5.0 (Linux; Android 11; KFTRWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/120.4.1 like Chrome/120.0 Safari/537.36')).toBe('fire')
    expect(detectDevice('Mozilla/5.0 (Linux; Android 9; KFMAWI) AppleWebKit/537.36 Chrome/119 Safari/537.36')).toBe('fire')
  })
  it('recognises Android phones and tablets', () => {
    expect(detectDevice('Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 Chrome/126 Safari/537.36')).toBe('android')
  })
  it('recognises iPads, also when they say Macintosh', () => {
    expect(detectDevice('Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile/15E148 Safari/604.1')).toBe('ipad')
    expect(detectDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 5)).toBe('ipad')
    expect(detectDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 0)).toBe('computer')
  })
  it('recognises iPhones and computers', () => {
    expect(detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1')).toBe('iphone')
    expect(detectDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Edg/126')).toBe('computer')
  })
})
