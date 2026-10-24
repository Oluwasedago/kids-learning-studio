import { Square, Volume2, VolumeX } from 'lucide-react'
import { useMuted, useSpeaking } from './useSpeaking'

/**
 * The icon of a speaker button: a speaker; a stop square while its text is being read (tap again: stop); a
 * crossed speaker while reading aloud is muted (the button stays silent then).
 */
export function ReadIcon({ text }: { text: string }) {
  const speaking = useSpeaking(text)
  const muted = useMuted()
  return muted ? <VolumeX /> : speaking ? <Square /> : <Volume2 />
}
