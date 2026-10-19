import { createContext, useContext } from 'react'
import type { Progress, Settings } from '@/data/types'

/** The screens, in menu order. */
export const SCREENS = ['home', 'learn', 'games', 'radio', 'parents'] as const
export type Screen = (typeof SCREENS)[number]

// What every screen can read (filled by <StudioData> in StudioData.tsx). All of it lives on this device.

export interface StudioState {
  now: Date
  settings: Settings
  settingsReady: boolean
  updateSettings: (change: (s: Settings) => Settings) => void
  progress: Progress
  updateProgress: (change: (p: Progress) => Progress) => void
}

export const StudioContext = createContext<StudioState | null>(null)

export function useStudio(): StudioState {
  const s = useContext(StudioContext)
  if (!s) throw new Error('useStudio outside StudioData')
  return s
}
