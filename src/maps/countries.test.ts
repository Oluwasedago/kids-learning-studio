import { describe, expect, it } from 'vitest'
import { stringsFor } from '@/i18n'
import { COUNTRY_FACTS, countryLines, currencyNames, factsOf, languageNames, peopleWords, sizeVsGermany, spoken } from './countries'
import world from './data/world.json'

type Topo = { objects: Record<string, { geometries: { properties: Record<string, string> }[] }> }
const onMap = Object.values((world as unknown as Topo).objects)[0].geometries.map((g) => g.properties)

describe('country facts', () => {
  it('every country on the map has facts: a capital in each language, people, area, real neighbours', () => {
    for (const p of onMap) {
      const f = factsOf(p.iso)
      expect(f, p.en).toBeTruthy()
      for (const lang of ['de', 'en', 'fr'] as const) expect(f!.capital?.[lang], `${p.iso} ${lang}`).toBeTruthy()
      expect(f!.pop, p.iso).toBeGreaterThan(0)
      expect(f!.area, p.iso).toBeGreaterThan(0)
      expect(f!.borders, p.iso).not.toContain(p.iso)
      for (const b of f!.borders) expect(COUNTRY_FACTS[b] ?? b.length, `${p.iso} → ${b}`).toBeTruthy()
    }
  })

  it('has the right capitals, the corrected ones too', () => {
    expect(factsOf('DE')?.capital?.de).toBe('Berlin')
    expect(factsOf('IT')?.capital?.de).toBe('Rom')
    expect(factsOf('ZA')?.capital?.en).toBe('Pretoria')
    expect(factsOf('TZ')?.capital?.en).toBe('Dodoma')
    expect(factsOf('BJ')?.capital?.en).toBe('Porto-Novo')
    expect(factsOf('KZ')?.capital?.en).toBe('Astana')
    expect(factsOf('LK')?.capital?.en).toBe('Sri Jayawardenepura Kotte')
  })

  it('neighbours go both ways', () => {
    for (const [iso, f] of Object.entries(COUNTRY_FACTS))
      for (const b of f.borders) if (COUNTRY_FACTS[b]) expect(COUNTRY_FACTS[b].borders, `${b} should list ${iso}`).toContain(iso)
  })
})

describe('number words', () => {
  it('says numbers the way a child can read them', () => {
    expect(peopleWords(1_402_000_000, 'de')).toBe('1,4 Milliarden')
    expect(peopleWords(1_402_000_000, 'en')).toBe('1.4 billion')
    expect(peopleWords(83_132_799, 'de')).toBe('83 Millionen')
    expect(peopleWords(83_132_799, 'fr')).toBe('83 millions')
    expect(peopleWords(5_400_000, 'en')).toBe('5.4 million')
    expect(peopleWords(1_000_000, 'de')).toBe('1 Million')
    expect(peopleWords(1_000_000, 'fr')).toBe('1 million')
    expect(peopleWords(341_250, 'de')).toBe('341.000')
    expect(peopleWords(4_321, 'en')).toBe('4,300')
  })

  it('compares the size with Germany', () => {
    expect(sizeVsGermany(923_768)).toEqual({ kind: 'bigger', times: 3 })
    expect(sizeVsGermany(312_000)).toEqual({ kind: 'same', times: 1 })
    expect(sizeVsGermany(41_000)).toEqual({ kind: 'smaller', times: 9 })
  })
})

describe('reading the card aloud', () => {
  it('pauses after each line, never twice', () => {
    expect(spoken(['Nigeria', 'Capital: Abuja', 'About 3 times as big as Germany.'])).toBe('Nigeria. Capital: Abuja. About 3 times as big as Germany.')
  })
})

describe('names from the browser', () => {
  it('names languages and money in the app language', () => {
    expect(languageNames(['deu', 'yor'], 'de')).toEqual(['Deutsch', 'Yoruba'])
    expect(languageNames(['fra'], 'en')).toEqual(['French'])
    expect(currencyNames(['EUR'], 'de')).toEqual(['Euro'])
    expect(currencyNames(['NGN'], 'en')[0]).toMatch(/Naira/)
  })

  it('a country card reads well in every language and never shows a bare code', () => {
    const nigeria = { id: 'NG', names: { de: 'Nigeria', en: 'Nigeria', fr: 'Nigeria' }, continent: 'Africa' }
    expect(countryLines(nigeria, 'en', stringsFor('en'))).toEqual([
      'Nigeria',
      'Continent: Africa',
      'Capital: Abuja',
      'People: about 201 million',
      'About 3 times as big as Germany.',
      'Languages: English',
      'Money: Nigerian Naira',
    ])
    for (const lang of ['de', 'en', 'fr'] as const)
      for (const p of onMap) {
        const f = factsOf(p.iso)!
        // No ISO code left over where the browser has no name ("Languages: ber" or "Money: XAF"); French calls Lao "lao".
        for (const name of languageNames(f.languages, lang)) expect(f.languages.includes(name) && name !== 'lao', `${p.iso} ${lang} ${name}`).toBe(false)
        for (const name of currencyNames(f.currencies, lang)) expect(f.currencies, `${p.iso} ${lang}`).not.toContain(name)
        expect(languageNames(f.languages, lang).length, `${p.iso} ${lang}: at least one language`).toBeGreaterThan(0)
        expect(countryLines({ id: p.iso, names: { de: p.de, en: p.en, fr: p.fr }, continent: p.cont }, lang, stringsFor(lang)).length).toBeGreaterThanOrEqual(6)
      }
  })
})
