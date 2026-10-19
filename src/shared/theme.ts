import { useEffect, useState } from 'react'

// Light or dark. System follows the device's own dark mode (the default); Light and Dark are fixed.
// Chosen on the parent screen. Pure function tested in theme.test.ts.

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark']

export function isDark(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'system' ? systemDark : mode === 'dark'
}

/** Whether the device itself is set to dark mode (updates when it changes). */
export function useSystemDark(): boolean {
  const query = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const m = matchMedia(query)
    const change = () => setDark(m.matches)
    m.addEventListener('change', change)
    return () => m.removeEventListener('change', change)
  }, [])
  return dark
}
