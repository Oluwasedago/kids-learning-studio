import { en, type Strings } from './en'

// One strings object per language and a useT() hook. v1 is English only; the shape is ready for more.
export type { Strings }
export type Lang = 'en'

export const LANGS: { id: Lang; name: string }[] = [{ id: 'en', name: 'English' }]
const STRINGS: Record<Lang, Strings> = { en }
/** Intl locale per UI language (dates and times): the device's English variant (en-US, en-GB…), else en-GB. */
export const LOCALES: Record<Lang, string> = {
  en: globalThis.navigator?.language?.startsWith('en') ? navigator.language : 'en-GB',
}

/** The current language (fixed to English in v1). */
export function useLang(): Lang {
  return 'en'
}

/** The current language's strings, e.g. `const t = useT(); t.nav.home`. */
export function useT(): Strings {
  return STRINGS[useLang()]
}
