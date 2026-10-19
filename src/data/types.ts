import type { ThemeMode } from '@/shared/theme'

// The documents saved on the device. Step 2 adds the wizard answers, access control, missions and reports.

/** Settings the parents choose (setup wizard and parent screen). */
export interface Settings {
  /** First name or nickname, shown in the greeting. Empty until the setup wizard has run. */
  childName: string
  theme: ThemeMode
  /** ms since 1970 of the last change. */
  updatedAt: number
}

/** The child's stars and finished missions. */
export interface Progress {
  /** Stars earned per day, "YYYY-MM-DD" → count. */
  stars: Record<string, number>
  /** Missions finished per day, "YYYY-MM-DD" → mission ids. */
  missions: Record<string, string[]>
  updatedAt: number
}

export const DEFAULT_SETTINGS: Settings = { childName: '', theme: 'system', updatedAt: 0 }
export const EMPTY_PROGRESS: Progress = { stars: {}, missions: {}, updatedAt: 0 }
