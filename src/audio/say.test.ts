import { describe, expect, it } from 'vitest'
import { voiceScore } from './say'

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
