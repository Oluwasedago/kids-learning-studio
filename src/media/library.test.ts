import { describe, expect, it } from 'vitest'
import { LIBRARY_VIDEOS, shelfVideos, VIDEO_SHELVES } from './library'

describe('video library', () => {
  it('has valid, different YouTube ids, a title and a channel for every video', () => {
    for (const v of LIBRARY_VIDEOS) {
      expect(v.id, v.title).toMatch(/^[\w-]{11}$/)
      expect(v.title.length > 2 && v.channel.length > 2, v.id).toBe(true)
    }
    expect(new Set(LIBRARY_VIDEOS.map((v) => v.id)).size).toBe(LIBRARY_VIDEOS.length)
  })
  it('fills every shelf, puts the app language first, and marks the live cams', () => {
    for (const s of VIDEO_SHELVES) expect(shelfVideos(s, 'en').length).toBeGreaterThanOrEqual(6)
    expect(shelfVideos('made', 'de')[0].lang).toBe('de')
    expect(shelfVideos('works', 'fr')[0].lang).toBe('fr')
    expect(shelfVideos('cams', 'en').every((v) => v.live)).toBe(true)
  })
})
