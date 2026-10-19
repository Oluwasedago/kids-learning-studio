import { useEffect, useState } from 'react'

// Reading aloud with the browser's own voices (Web Speech API). Works on Chrome/Android and iPad; on Fire
// tablets voices may be missing (to verify on a device). Nothing depends on sound: the screen always shows
// the same words or a picture.

const voiceFor = (lang: string) => {
  if (!('speechSynthesis' in window)) return undefined
  const voices = speechSynthesis.getVoices()
  return voices.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) ?? voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)))
}

/** True when this device can read aloud in English. */
export const canSpeak = () => Boolean(voiceFor('en-GB'))

/** canSpeak() that updates when the browser finishes loading its voices (they often arrive after the page). */
export function useCanSpeak(): boolean {
  const [can, setCan] = useState(canSpeak)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const update = () => setCan(canSpeak())
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])
  return can
}

/** Reads a text aloud (stops anything still being read). Returns false when no voice is available. */
export function sayText(text: string, lang = 'en-GB'): boolean {
  const voice = voiceFor(lang)
  if (!voice) return false
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.9
    speechSynthesis.speak(u)
    return true
  } catch (err) {
    console.warn('speech failed:', err)
    return false
  }
}
