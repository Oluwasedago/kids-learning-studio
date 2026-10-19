import { createContext, useContext } from 'react'
import type { ItemId } from '@/access/catalogue'

// One audio player for the whole app (radio and stories), so two things never play at once and sound keeps
// playing while the child moves between screens. Filled by <PlayerProvider>.

export interface Playing {
  /** The access item it belongs to ('radio' or 'stories'): playback stops when that item closes. */
  item: ItemId
  /** Station or track id. */
  id: string
  title: string
  url: string
  live: boolean
}

export interface Player {
  playing: Playing | null
  state: 'stopped' | 'loading' | 'playing' | 'paused' | 'error'
  /** Seconds played and the total (0 for live radio). */
  time: number
  duration: number
  play: (p: Playing) => void
  toggle: () => void
  stop: () => void
}

export const PlayerContext = createContext<Player>({
  playing: null,
  state: 'stopped',
  time: 0,
  duration: 0,
  play: () => {},
  toggle: () => {},
  stop: () => {},
})

export const usePlayer = () => useContext(PlayerContext)
