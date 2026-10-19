import { describe, expect, it } from 'vitest'
import { callLinkOk, COLLECTIONS, embedUrl, parseYouTube, STATIONS } from './sources'

describe('listen and watch sources', () => {
  it('only uses HTTPS addresses', () => {
    for (const s of STATIONS) expect(s.url).toMatch(/^https:\/\//)
    for (const c of COLLECTIONS) for (const t of c.tracks) expect(t.url).toMatch(/^https:\/\/archive\.org\/download\//)
  })
  it('reads YouTube links of every common shape', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toEqual({ kind: 'video', id: 'dQw4w9WgXcQ' })
    expect(parseYouTube('https://youtu.be/dQw4w9WgXcQ')).toEqual({ kind: 'video', id: 'dQw4w9WgXcQ' })
    expect(parseYouTube('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual({ kind: 'video', id: 'dQw4w9WgXcQ' })
    expect(parseYouTube('https://www.youtube.com/playlist?list=PL1234567890abc')).toEqual({ kind: 'playlist', id: 'PL1234567890abc' })
    expect(parseYouTube('https://example.com/video')).toBeNull()
  })
  it('plays videos through youtube-nocookie without related videos from other channels', () => {
    expect(embedUrl({ kind: 'video', id: 'dQw4w9WgXcQ' })).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?.*rel=0/)
  })
  it('accepts only call links that start a call', () => {
    expect(callLinkOk('tel:+44 20 7946 0000')).toBe(true)
    expect(callLinkOk('https://wa.me/447700900000')).toBe(true)
    expect(callLinkOk('facetime:someone@example.com')).toBe(true)
    expect(callLinkOk('https://example.com')).toBe(false)
    expect(callLinkOk('javascript:alert(1)')).toBe(false)
  })
})
