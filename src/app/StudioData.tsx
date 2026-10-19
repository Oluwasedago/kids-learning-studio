import { type ReactNode, useEffect, useState } from 'react'
import { accessState, earnedSecondsLeft } from '@/access/access'
import { useLocalDoc } from '@/data/localDoc'
import { DEFAULT_SETTINGS, EMPTY_PROGRESS, EMPTY_USAGE, type Progress, type Settings, type Usage } from '@/data/types'
import { ageFrom, isoDate } from '@/shared/date'
import { StudioContext, type StudioState } from './studio'

// Everything the screens need, loaded once from the device: settings, progress and the usage log.

/** The current time, updated every 15 seconds (testable with ?at=HH:MM or ?date=YYYY-MM-DD). */
function useNow(): Date {
  const [now, setNow] = useState(readNow)
  useEffect(() => {
    const t = setInterval(() => setNow(readNow()), 15_000)
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
  const usage = useLocalDoc<Usage>('usage', EMPTY_USAGE)
  const today = isoDate(now)
  const s = settings.doc
  const earnedLeft = earnedSecondsLeft(progress.doc, usage.doc, s.rewards, today)

  // The child's colour on buttons and the menu.
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', s.child.accent)
  }, [s.child.accent])

  const state: StudioState = {
    now,
    today,
    age: ageFrom(s.child.birthMonth, s.child.birthYear, now),
    settings: s,
    ready: settings.ready && progress.ready && usage.ready,
    updateSettings: settings.update,
    progress: progress.doc,
    updateProgress: progress.update,
    usage: usage.doc,
    updateUsage: usage.update,
    earnedLeft,
    accessOf: (id) => accessState(s.access[id], today, earnedLeft),
  }
  return <StudioContext.Provider value={state}>{children}</StudioContext.Provider>
}
