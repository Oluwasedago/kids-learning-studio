import { useEffect, useState } from 'react'

// Reading aloud with the device's own voices (Web Speech API). Quality depends on the voices installed:
//   - iPad: Settings → Accessibility → Spoken Content → Voices → English → download an "Enhanced" or "Premium"
//     voice (Siri-quality, works offline).
//   - Android / Fire: the text-to-speech engine in the device settings; Google's engine offers downloadable
//     high-quality voices (Fire: to verify which engine and voices it has).
//   - Edge on a PC also offers "Natural" voices; these are online (the spoken text goes to Microsoft).
// The app picks the best voice it finds; parents can choose another one on the parent screen.
// Nothing depends on sound: the screen always shows the same words or a picture.

export interface VoicePreference {
  /** The chosen voice's name, or null for "best available". */
  name: string | null
  /** 0.6 (slow) – 1.2 (fast); 0.9 suits young children. */
  rate: number
}

let preference: VoicePreference = { name: null, rate: 0.9 }

/** Set from the parent settings (App.tsx). */
export function setVoicePreference(p: VoicePreference) {
  preference = p
}

const NOVELTY = /compact|espeak|novelty|whisper|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|zarvox|albert|bahh|fred|junior|ralph/i
const GOOD = /natural|neural|premium|enhanced|wavenet|siri/i

/** Languages the app reads aloud in: the app languages, and English for the English lessons. */
export type SpeechLang = 'en' | 'de' | 'fr'
const DEFAULT_VARIANT: Record<SpeechLang, string> = { en: 'en-GB', de: 'de-DE', fr: 'fr-FR' }

/** The preferred variant of a language: the device's own (en-US, de-AT…) when it matches, else a default. */
const variant = (lang: SpeechLang) => (globalThis.navigator?.language?.toLowerCase().startsWith(lang) ? navigator.language : DEFAULT_VARIANT[lang])

/** How natural a voice probably sounds for a language (higher is better; other languages far below). Pure (tested). */
export function voiceScore(v: { name: string; lang: string; localService: boolean }, preferredLang = 'en-GB'): number {
  if (!v.lang.toLowerCase().startsWith(preferredLang.slice(0, 2).toLowerCase())) return -100
  let score = 0
  if (GOOD.test(v.name)) score += 10
  if (/google/i.test(v.name)) score += 5
  if (NOVELTY.test(v.name)) score -= 20
  if (v.lang.replace('_', '-').toLowerCase() === preferredLang.toLowerCase()) score += 3
  // Voices on the device keep everything private and work offline: by default they always win over online
  // voices (an online voice sends the spoken text to Google or Microsoft). Parents can still choose one.
  if (v.localService) score += 20
  return score
}

/** The voices for a language, best first. */
export function voicesFor(lang: SpeechLang): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  const preferred = variant(lang)
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith(lang))
    .sort((a, b) => voiceScore(b, preferred) - voiceScore(a, preferred))
}

/** The parent's chosen voice when it speaks this language, else the best one for it. */
function currentVoice(lang: SpeechLang): SpeechSynthesisVoice | undefined {
  const voices = voicesFor(lang)
  return (preference.name && voices.find((v) => v.name === preference.name)) || voices[0]
}

/** The voices for a language, updated when the browser finishes loading them (they often arrive after the page). */
export function useVoices(lang: SpeechLang = 'en'): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState(() => voicesFor(lang))
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const update = () => setVoices(voicesFor(lang))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [lang])
  return voices
}

/** True (and updated when the voices arrive) when this device can read aloud in the language. */
export const useCanSpeak = (lang: SpeechLang = 'en') => useVoices(lang).length > 0

/** Reads a text aloud in its language (stops anything still being read). Returns false when no voice is available. */
export function sayText(text: string, lang: SpeechLang = 'en'): boolean {
  const voice = currentVoice(lang)
  if (!voice) return false
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = preference.rate
    speechSynthesis.speak(u)
    return true
  } catch (err) {
    console.warn('speech failed:', err)
    return false
  }
}
