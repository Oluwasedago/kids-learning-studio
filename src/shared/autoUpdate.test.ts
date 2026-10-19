import { describe, expect, it } from 'vitest'
import { appScript } from './autoUpdate'

describe('auto update', () => {
  it('finds the app file a page names, with a relative or absolute path', () => {
    expect(appScript('<script type="module" crossorigin src="./assets/index-B8eSRqwV.js"></script>')).toBe('assets/index-B8eSRqwV.js')
    expect(appScript('<script type="module" src="/assets/index-B8eSRqwV.js"></script>')).toBe('assets/index-B8eSRqwV.js')
    expect(appScript('<script type="module" crossorigin src="./assets/app-DGZWOV0D.js"></script><link href="./assets/en-B1.js">')).toBe('assets/app-DGZWOV0D.js')
    expect(appScript('<html>offline</html>')).toBeNull()
  })
})
