import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/lessons/data'
import world from './data/world.json'
import { answer, boxPoints, CONTINENTS, CONTINENT_COLORS, countryName, fitBox, nextTarget, quizCountries, quizKind, tooSmallToTap, ZOOM_AREAS } from './maps'

type Topo = { objects: Record<string, { geometries: { properties: Record<string, string> }[] }> }
const onMap = Object.values((world as unknown as Topo).objects)[0].geometries.map((g) => g.properties)

describe('world map data', () => {
  it('every country has a code, names and a known continent with a colour', () => {
    for (const c of onMap) {
      expect(c.iso, c.en).toMatch(/^[A-Z]{2}$/)
      expect(c.de && c.en, c.iso).toBeTruthy()
      expect(Object.keys(CONTINENTS), c.iso).toContain(c.cont)
      expect(CONTINENT_COLORS[c.cont]).toBeTruthy()
    }
  })

  it('most countries from the flag lessons are on the map', () => {
    const isos = new Set(onMap.map((c) => c.iso))
    const missing = COUNTRIES.filter((c) => !isos.has(c.id.toUpperCase()))
    // Very small countries are not on the 1:110 million map (they stay in the flag lessons).
    expect(missing.length).toBeLessThan(COUNTRIES.length / 4)
  })

  it('uses the short everyday name of a country', () => {
    const china = { id: 'CN', names: { de: 'Volksrepublik China', en: "People's Republic of China", fr: 'Chine' }, continent: 'Asia' }
    expect(countryName(china, 'en')).toBe('China')
    expect(countryName(china, 'de')).toBe('China')
    expect(countryName({ id: 'XX', names: { de: 'Irgendwo', en: 'Somewhere', fr: '' }, continent: 'Asia' }, 'fr')).toBe('Somewhere')
  })
})

describe('zoom', () => {
  it('fits a box to the map frame, keeping the map in shape', () => {
    // Wide area into a 2:1 frame: the height grows.
    expect(fitBox([[0, 0], [100, 20]], 2, 0)).toEqual({ x: 0, y: -15, w: 100, h: 50 })
    // Tall area: the width grows; the middle stays where it was.
    expect(fitBox([[10, 10], [30, 50]], 2, 0)).toEqual({ x: -20, y: 10, w: 80, h: 40 })
    const withMargin = fitBox([[0, 0], [100, 50]], 2)
    expect(withMargin.w).toBeCloseTo(108)
    expect(withMargin.h).toBeCloseTo(54)
  })

  it('a country smaller than a fingertip gets its own tap target', () => {
    expect(tooSmallToTap([[0, 0], [10, 5]], 2)).toBe(true) // 20 px
    expect(tooSmallToTap([[0, 0], [10, 40]], 2)).toBe(false) // 80 px tall
    expect(tooSmallToTap([[0, 0], [32, 1]], 2)).toBe(false) // exactly 64 px wide
  })

  it('every zoom area is a real box, and the points around it cover its corners', () => {
    for (const [w, s, e, n] of Object.values(ZOOM_AREAS)) {
      expect(w).toBeLessThan(e)
      expect(s).toBeLessThan(n)
    }
    const points = boxPoints([0, 0, 10, 20], 2)
    for (const corner of [[0, 0], [10, 0], [0, 20], [10, 20]]) expect(points).toContainEqual(corner)
  })
})

describe('map quiz', () => {
  it('never asks the same thing twice in a row', () => {
    let last: string | null = null
    for (let i = 0; i < 50; i++) {
      const next = nextTarget(['a', 'b', 'c'], last)
      expect(next).not.toBe(last)
      last = next
    }
    expect(nextTarget(['a'], 'a')).toBe('a')
  })

  it('three wrong taps show the answer; a right tap counts at any time', () => {
    let q = { target: 'BR', misses: 0 }
    expect(answer(q, 'BR').result).toBe('right')
    for (const expected of ['wrong', 'wrong', 'shown']) {
      const r = answer(q, 'AR')
      expect(r.result).toBe(expected)
      q = r.quiz
    }
    expect(answer({ target: 'BR', misses: 2 }, 'BR').result).toBe('right')
  })

  it('continents for younger children, countries from stage 3', () => {
    expect(quizKind(0)).toBe('continents')
    expect(quizKind(2)).toBe('continents')
    expect(quizKind(3)).toBe('countries')
    expect(quizKind(7)).toBe('countries')
  })

  it('only countries big enough to tap', () => {
    expect(quizCountries(['DE', 'LU', 'XX'], [{ id: 'DE', area: 500 }, { id: 'LU', area: 2 }], 100)).toEqual(['DE'])
  })
})
