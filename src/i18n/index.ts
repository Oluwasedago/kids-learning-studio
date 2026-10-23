import { createContext, useContext } from 'react'
import { de } from './de'
import { en, type Strings } from './en'
import { fr } from './fr'

// One strings object per language (en.ts, de.ts, fr.ts; each typed as Strings, so a missing text fails the
// build) and a useT() hook. The language is a parent setting; until it is set, the device language decides.
export type { Strings }
export type Lang = 'en' | 'de' | 'fr'

/** The languages, each named in itself (shown in the language picker). */
export const LANGS: { id: Lang; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'de', name: 'Deutsch' },
  { id: 'fr', name: 'Français' },
]
const STRINGS: Record<Lang, Strings> = { en, de, fr }

const deviceLanguage = globalThis.navigator?.language ?? 'en-GB'

/** The app language that matches the device (German or French devices get theirs, everything else English). */
export function deviceLang(language = deviceLanguage): Lang {
  const l = language.toLowerCase()
  return l.startsWith('de') ? 'de' : l.startsWith('fr') ? 'fr' : 'en'
}

/** Intl locale per UI language (dates and times): the device's own variant when it matches (en-US, de-AT…). */
export const LOCALES: Record<Lang, string> = {
  en: deviceLanguage.startsWith('en') ? deviceLanguage : 'en-GB',
  de: deviceLanguage.startsWith('de') ? deviceLanguage : 'de-DE',
  fr: deviceLanguage.startsWith('fr') ? deviceLanguage : 'fr-FR',
}

/** The current language, provided by the app root from the settings (App.tsx). */
export const LangContext = createContext<Lang>(deviceLang())

export const stringsFor = (lang: Lang): Strings => STRINGS[lang]

/** The current language. */
export function useLang(): Lang {
  return useContext(LangContext)
}

/** The current language's strings, e.g. `const t = useT(); t.nav.home`. */
export function useT(): Strings {
  return STRINGS[useLang()]
}
