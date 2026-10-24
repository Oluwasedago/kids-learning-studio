import { beforeEach, describe, expect, it } from 'vitest'
import { isMuted, readOut, sayText, setMuted, speakingText, stopSpeech, voiceScore } from './say'
import { stopOnLeave } from './useSpeaking'

/**
 * A stand-in for the browser's speech engine. It logs what it is told (the text, or "[cancel]"), and like Chrome
 * reports the end of a cancelled reading a moment later. `finish()` ends the current reading normally.
 */
function fakeSpeech() {
  type Utterance = { text: string; onend?: () => void; onerror?: () => void }
  const log: string[] = []
  let speaking: Utterance | null = null
  const g = globalThis as Record<string, unknown>
  g.window ??= globalThis
  g.SpeechSynthesisUtterance = class {
    text: string
    constructor(text: string) {
      this.text = text
    }
  }
  g.speechSynthesis = {
    getVoices: () => [{ name: 'Test', lang: 'en-GB', localService: true }, { name: 'Test DE', lang: 'de-DE', localService: true }],
    speak: (u: Utterance) => {
      log.push(u.text)
      speaking = u
    },
    cancel: () => {
      log.push('[cancel]')
      const was = speaking
      speaking = null
      if (was) queueMicrotask(() => was.onerror?.())
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  return {
    log,
    said: () => log.filter((x) => x !== '[cancel]'),
    finish: () => {
      const was = speaking
      speaking = null
      was?.onend?.()
    },
  }
}

describe('reading aloud', () => {
  let speech: ReturnType<typeof fakeSpeech>
  beforeEach(() => {
    speech = fakeSpeech()
    setMuted(false)
    stopSpeech()
  })

  it('knows when the reading has finished (the end event)', () => {
    sayText('Nigeria')
    expect(speakingText()).toBe('Nigeria')
    speech.finish()
    expect(speakingText()).toBeNull()
  })

  it('a new text cuts off the one being read (no overlapping voices)', async () => {
    sayText('Nigeria')
    sayText('Cameroon')
    expect(speech.said()).toEqual(['Nigeria', 'Cameroon'])
    // The old one was cancelled right before the new one started.
    expect(speech.log[speech.log.indexOf('Cameroon') - 1]).toBe('[cancel]')
    // Its late end report does not end the new reading, even when the new text is the same.
    sayText('Cameroon')
    await Promise.resolve()
    expect(speakingText()).toBe('Cameroon')
  })

  it('the same speaker button tapped again stops it; another button starts its own text', () => {
    readOut('Capital: Abuja')
    expect(speakingText()).toBe('Capital: Abuja')
    readOut('Capital: Abuja')
    expect(speakingText()).toBeNull()
    expect(speech.said()).toEqual(['Capital: Abuja'])
    readOut('Capital: Abuja')
    readOut('Money: Naira')
    expect(speakingText()).toBe('Money: Naira')
  })

  it('muted: nothing is read, not even by a speaker button; muting stops the voice', () => {
    sayText('Nigeria')
    setMuted(true)
    expect(isMuted()).toBe(true)
    expect(speakingText()).toBeNull()
    expect(speech.log[speech.log.length - 1]).toBe('[cancel]')
    expect(sayText('Cameroon')).toBe(false)
    expect(readOut('Capital: Abuja')).toBe(false)
    expect(speech.said()).toEqual(['Nigeria'])
    setMuted(false)
    expect(sayText('Cameroon')).toBe(true)
  })

  it('leaving a screen stops the reading', () => {
    sayText('Where is Brazil?')
    const cleanup = stopOnLeave()
    expect(speakingText()).toBe('Where is Brazil?')
    cleanup()
    expect(speakingText()).toBeNull()
  })

  it('without a voice for the language nothing is read and nothing counts as reading', () => {
    expect(sayText('Bonjour', 'fr')).toBe(false)
    expect(speakingText()).toBeNull()
  })
})

const v = (name: string, lang = 'en-GB', localService = true) => ({ name, lang, localService })

describe('voice choice', () => {
  it('prefers natural voices, avoids novelty and compact ones, ignores other languages', () => {
    expect(voiceScore(v('Daniel (Enhanced)'))).toBeGreaterThan(voiceScore(v('Daniel')))
    expect(voiceScore(v('Google UK English Female'))).toBeGreaterThan(voiceScore(v('Daniel')))
    expect(voiceScore(v('Zarvox'))).toBeLessThan(voiceScore(v('Daniel')))
    expect(voiceScore(v('Samantha (Compact)', 'en-US'))).toBeLessThan(voiceScore(v('Samantha', 'en-US')))
    expect(voiceScore(v('Anna', 'de-DE'))).toBeLessThan(0)
  })
  it('scores voices for the language asked for', () => {
    expect(voiceScore(v('Anna', 'de-DE'), 'de-DE')).toBeGreaterThan(0)
    expect(voiceScore(v('Daniel', 'en-GB'), 'de-DE')).toBeLessThan(0)
    expect(voiceScore(v('Thomas', 'fr-FR'), 'fr-FR')).toBeGreaterThan(voiceScore(v('Amélie', 'fr-CA'), 'fr-FR'))
  })
  it('prefers voices on the device (even over online natural ones), and the preferred English variant', () => {
    expect(voiceScore(v('Voice', 'en-GB', true))).toBeGreaterThan(voiceScore(v('Voice', 'en-GB', false)))
    expect(voiceScore(v('Microsoft Hazel', 'en-GB', true))).toBeGreaterThan(voiceScore(v('Microsoft Sonia Online (Natural)', 'en-GB', false)))
    expect(voiceScore(v('Voice', 'en-GB'), 'en-GB')).toBeGreaterThan(voiceScore(v('Voice', 'en-US'), 'en-GB'))
  })
})
