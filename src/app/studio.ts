import { createContext, useContext } from 'react'
import type { AccessState } from '@/access/access'
import type { ItemId } from '@/access/catalogue'
import type { Progress, Settings, Usage } from '@/data/types'

/** The screens, in menu order. */
export const SCREENS = ['home', 'learn', 'games', 'radio', 'parents'] as const
export type Screen = (typeof SCREENS)[number]

// What every screen can read (filled by <StudioData> in StudioData.tsx). All of it lives on this device.

export interface StudioState {
  now: Date
  /** "YYYY-MM-DD" of `now`. */
  today: string
  /** The child's age in years (from birth month and year). */
  age: number
  settings: Settings
  /** All three documents have been read from the device. */
  ready: boolean
  updateSettings: (change: (s: Settings) => Settings) => void
  progress: Progress
  updateProgress: (change: (p: Progress) => Progress) => void
  usage: Usage
  updateUsage: (change: (u: Usage) => Usage) => void
  /** Earned seconds left today. */
  earnedLeft: number
  /** Access state of an item now (two-layer access control). */
  accessOf: (id: ItemId) => AccessState
}

export const StudioContext = createContext<StudioState | null>(null)

export function useStudio(): StudioState {
  const s = useContext(StudioContext)
  if (!s) throw new Error('useStudio outside StudioData')
  return s
}
