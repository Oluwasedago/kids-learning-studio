import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/lessons/data'
import world from './data/world.json'
import { answer, CONTINENTS, CONTINENT_COLORS, countryName, nextTarget, quizCountries, quizKind } from './maps'

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
