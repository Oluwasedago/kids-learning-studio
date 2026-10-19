import { type ReactNode, useEffect, useState } from 'react'
import { useLocalDoc } from '@/data/localDoc'
import { DEFAULT_SETTINGS, EMPTY_PROGRESS, type Progress, type Settings } from '@/data/types'
import { StudioContext, type StudioState } from './studio'

// Everything the screens need, loaded once from the device: settings and progress.

/** The current time, updated every 30 seconds (testable with ?at=HH:MM or ?date=YYYY-MM-DD). */
function useNow(): Date {
  const [now, setNow] = useState(readNow)
  useEffect(() => {
    const t = setInterval(() => setNow(readNow()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

function readNow(): Date {
  const q = new URLSearchParams(location.search)
  const d = new Date()
  const date = q.get('date')?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (date) d.setFullYear(Number(date[1]), Number(date[2]) - 1, Number(date[3]))
  const at = q.get('at')?.match(/^(\d{1,2}):(\d{2})$/)
  if (at) d.setHours(Number(at[1]), Number(at[2]))
  return d
}

export function StudioData({ children }: { children: ReactNode }) {
  const now = useNow()
  const settings = useLocalDoc<Settings>('settings', DEFAULT_SETTINGS)
  const progress = useLocalDoc<Progress>('progress', EMPTY_PROGRESS)

  const state: StudioState = {
    now,
    settings: settings.doc,
    settingsReady: settings.ready,
    updateSettings: settings.update,
    progress: progress.doc,
    updateProgress: progress.update,
  }
  return <StudioContext.Provider value={state}>{children}</StudioContext.Provider>
}
