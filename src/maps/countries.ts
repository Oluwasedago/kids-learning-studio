import { type Lang, LOCALES, type Strings } from '@/i18n'
import { CONTINENTS, countryName, type Region } from './maps'
import data from './data/countries.json'

// What a child learns by tapping a country: capital, how many people, size compared with Germany, languages,
// money, neighbours. Data: countries.json (SOURCES.md: Natural Earth, mledoze/countries). Language and money
// names come from the browser (Intl), so they appear in the app's language without lists of our own.
// Pure functions, tested in countries.test.ts.

export interface CountryFacts {
  capital: Record<Lang, string> | null
  /** Population estimate (Natural Earth) for popYear. */
  pop: number
  popYear: number
  /** km². */
  area: number
  /** ISO 639-3 codes, e.g. "deu". */
  languages: string[]
  /** ISO 4217 codes, e.g. "EUR". */
  currencies: string[]
  /** Neighbours by land (ISO 3166-1 alpha-2). */
  borders: string[]
  landlocked: boolean
}

export const COUNTRY_FACTS = data as Record<string, CountryFacts>
export const factsOf = (iso: string): CountryFacts | undefined => COUNTRY_FACTS[iso]

const GERMANY_KM2 = 357_114

/** How many people, in words a child can say: "1.4 billion", "84 Millionen", "340 000". Pure (tested). */
export function peopleWords(n: number, lang: Lang): string {
  const fmt = (x: number, digits: number) => x.toLocaleString(LOCALES[lang], { maximumFractionDigits: digits })
  const unit = (x: number, one: Record<Lang, string>, many: Record<Lang, string>) => `${fmt(x, x < 10 ? 1 : 0)} ${x === 1 ? one[lang] : many[lang]}`
  if (n >= 1e9) return unit(Math.round(n / 1e8) / 10, { de: 'Milliarde', en: 'billion', fr: 'milliard' }, { de: 'Milliarden', en: 'billion', fr: 'milliards' })
  if (n >= 1e6) return unit(n < 1e7 ? Math.round(n / 1e5) / 10 : Math.round(n / 1e6), { de: 'Million', en: 'million', fr: 'million' }, { de: 'Millionen', en: 'million', fr: 'millions' })
  if (n >= 10_000) return fmt(Math.round(n / 1000) * 1000, 0)
  return fmt(Math.round(n / 100) * 100, 0)
}

/** Size compared with Germany: how many times bigger or smaller, or "about the same" (0.67–1.5). */
export function sizeVsGermany(area: number): { kind: 'same' | 'bigger' | 'smaller'; times: number } {
  const ratio = area / GERMANY_KM2
  if (ratio >= 1.5) return { kind: 'bigger', times: Math.round(ratio) }
  if (ratio > 0.67) return { kind: 'same', times: 1 }
  return { kind: 'smaller', times: Math.round(1 / ratio) }
}

/** Languages on the map that browsers have no name for (checked in Chrome and Node, Oct 2026). Rarer ones are
 * left out rather than shown as a code. */
const LANGUAGE_NAMES: Record<string, Record<Lang, string>> = {
  ber: { de: 'Berberisch', en: 'Berber', fr: 'berbère' },
  mey: { de: 'Hassania-Arabisch', en: 'Hassaniya Arabic', fr: 'arabe hassanya' },
  smi: { de: 'Samisch', en: 'Sami', fr: 'same' },
  nzs: { de: 'Neuseeländische Gebärdensprache', en: 'New Zealand Sign Language', fr: 'langue des signes néo-zélandaise' },
  lao: { de: 'Laotisch', en: 'Lao', fr: 'lao' },
}

/** Names from the browser (languages, currencies), then our own; codes nobody can name are left out. */
function namesOf(codes: string[], lang: Lang, type: 'language' | 'currency'): string[] {
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames([lang], { type, fallback: 'none' })
  } catch {
    // Old browser: only our own names.
  }
  return codes.flatMap((c) => {
    let name: string | undefined
    try {
      name = names?.of(c)
    } catch {
      // Not a code the browser accepts.
    }
    if (name && name !== c) return [name]
    const own = type === 'language' ? LANGUAGE_NAMES[c]?.[lang] : undefined
    return own ? [own] : []
  })
}

/** Language names in the app's language, e.g. "German", "Yoruba". At most four. */
export const languageNames = (codes: string[], lang: Lang) => namesOf(codes.slice(0, 4), lang, 'language')

/** Money names in the app's language, e.g. "Euro", "Nigerian Naira". At most two. */
export const currencyNames = (codes: string[], lang: Lang) => namesOf(codes.slice(0, 2), lang, 'currency')

/** The flag picture (flag-icons, MIT): each one is its own file, loaded only when its country is tapped. */
const FLAGS = import.meta.glob<string>('../../node_modules/flag-icons/flags/4x3/*.svg', { query: '?url', import: 'default' })
export async function flagUrl(iso: string): Promise<string | null> {
  const load = FLAGS[`../../node_modules/flag-icons/flags/4x3/${iso.toLowerCase()}.svg`]
  return load ? load() : null
}

/** The card's lines as one text to read aloud, a pause after each ("Capital: Abuja. People: …"). Pure (tested). */
export const spoken = (lines: string[]) => lines.map((l) => (/[.!?]$/.test(l) ? l : `${l}.`)).join(' ')

/** The card's sentences, which are also what is read aloud: name, continent, capital, people, size, languages,
 * money. Pure (tested). */
export function countryLines(region: Region, lang: Lang, t: Strings): string[] {
  const out = [countryName(region, lang)]
  if (CONTINENTS[region.continent]) out.push(t.maps.inContinent(CONTINENTS[region.continent][lang]))
  const f = factsOf(region.id)
  if (!f) return out
  if (f.capital) out.push(t.maps.capital(f.capital[lang]))
  out.push(t.maps.people(peopleWords(f.pop, lang)))
  if (region.id !== 'DE') {
    const size = sizeVsGermany(f.area)
    out.push(t.maps.size(size.kind, size.times))
  }
  const languages = languageNames(f.languages, lang)
  if (languages.length) out.push(t.maps.languages(languages.join(', ')))
  const money = currencyNames(f.currencies, lang)
  if (money.length) out.push(t.maps.money(money.join(', ')))
  if (f.landlocked) out.push(t.maps.landlocked)
  return out
}
