import { useEffect } from 'react'
import type { Usage } from '@/data/types'
import { addDays, isoDate } from '@/shared/date'

// What the app was used for: seconds per area per day, and how much earned time was used. Kept on the device
// for KEEP_DAYS (long enough for a monthly report). Pure functions tested in usage.test.ts.

export const KEEP_DAYS = 100
export const TICK_SECONDS = 15

/** Adds seconds to an area on a day (and to the earned time used, when `earned`); drops days older than KEEP_DAYS. */
export function addUsage(u: Usage, d: Date, area: string, seconds: number, earned: boolean, now = Date.now()): Usage {
  const date = isoDate(d)
  const oldest = isoDate(addDays(d, -(KEEP_DAYS - 1)))
  const keep = <T,>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([day]) => day >= oldest))
  const days = keep(u.days)
  const today = days[date] ?? {}
  days[date] = { ...today, [area]: (today[area] ?? 0) + seconds }
  const earnedUsed = keep(u.earnedUsed)
  if (earned) earnedUsed[date] = (earnedUsed[date] ?? 0) + seconds
  return { days, earnedUsed, updatedAt: now }
}

/** The area kind: "mission:maths" → "mission". */
export const areaKind = (area: string) => area.split(':')[0]

// ---- What is open right now ----

interface OpenArea {
  area: string
  /** Opened with earned time: its minutes count against today's earned time. */
  earned: boolean
}

/** Areas opened on top of the current screen (a mission, a game), innermost last. */
const open: OpenArea[] = []

/** Marks an area as open while the component is shown, e.g. useArea('game:snake', state === 'earned'). */
export function useArea(area: string | null, earned = false) {
  useEffect(() => {
    if (!area) return
    const entry = { area, earned }
    open.push(entry)
    return () => {
      const i = open.lastIndexOf(entry)
      if (i >= 0) open.splice(i, 1)
    }
  }, [area, earned])
}

/** The innermost open area, or the screen itself. */
export const currentArea = (screen: string): OpenArea => open[open.length - 1] ?? { area: screen, earned: false }
