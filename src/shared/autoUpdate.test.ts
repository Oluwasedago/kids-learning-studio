import { describe, expect, it } from 'vitest'
import { appScript, checkDue } from './autoUpdate'

describe('auto update', () => {
  it('checks for a new version once a day', () => {
    const day = 24 * 60 * 60_000
    expect(checkDue(1_000, 1_000 + day - 1)).toBe(false)
    expect(checkDue(1_000, 1_000 + day)).toBe(true)
    expect(checkDue(Number(null), Date.now())).toBe(true) // never checked
    expect(checkDue(Number('rubbish'), Date.now())).toBe(true)
  })

  it('finds the app file a page names, with a relative or absolute path', () => {
    expect(appScript('<script type="module" crossorigin src="./assets/index-B8eSRqwV.js"></script>')).toBe('assets/index-B8eSRqwV.js')
    expect(appScript('<script type="module" src="/assets/index-B8eSRqwV.js"></script>')).toBe('assets/index-B8eSRqwV.js')
    expect(appScript('<script type="module" crossorigin src="./assets/app-DGZWOV0D.js"></script><link href="./assets/en-B1.js">')).toBe('assets/app-DGZWOV0D.js')
    expect(appScript('<html>offline</html>')).toBeNull()
  })
})
