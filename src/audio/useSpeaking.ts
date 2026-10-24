import { useEffect, useSyncExternalStore } from 'react'
import { isMuted, onSpeechChange, speakingText, stopSpeech } from './say'

/** Whether reading aloud is muted (the round speaker button in the status bar). */
export const useMuted = (): boolean => useSyncExternalStore(onSpeechChange, isMuted)

/** Whether this text is being read right now (or anything, without a text). */
export function useSpeaking(text?: string): boolean {
  const now = useSyncExternalStore(onSpeechChange, speakingText)
  return text === undefined ? now !== null : now === text
}

/** The effect behind useStopSpeechOnLeave: nothing on the way in, stop on the way out. Pure (tested). */
export const stopOnLeave = () => stopSpeech

/**
 * Stops the reading when this view closes, or when `key` changes (another screen, tab, mode or game): leaving
 * stops what it was reading. Radio and stories play through their own player and keep going.
 */
export function useStopSpeechOnLeave(key?: unknown) {
  useEffect(stopOnLeave, [key])
}
