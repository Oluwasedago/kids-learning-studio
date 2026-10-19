import { useEffect, useRef } from 'react'

// New versions reach the tablet by themselves. An installed app can stay open for days, so every 15 minutes
// the Studio fetches its own start page and compares the app file named in it with the one it runs. When a
// new version is out, it reloads at the next quiet moment, never in the middle of a game or a story.

const CHECK_MS = 15 * 60_000

/** The app file a page names, e.g. "assets/index-B8eSRqwV.js" (with or without "./" or "/"). Pure (tested). */
export function appScript(html: string): string | null {
  return html.match(/assets\/index-[\w-]+\.js/)?.[0] ?? null
}

const running = () => appScript(document.documentElement.outerHTML)

/** Is a newer version deployed? False when offline. */
export async function newVersionOut(): Promise<boolean> {
  try {
    const res = await fetch('./', { cache: 'no-store' })
    if (!res.ok) return false
    const latest = appScript(await res.text())
    const mine = running()
    return Boolean(latest && mine && latest !== mine)
  } catch {
    return false
  }
}

/** Reloads into a new version once one is out and `quiet` is true (nothing is being played). */
export function useAutoUpdate(quiet: boolean) {
  const ready = useRef(false)
  useEffect(() => {
    if (!import.meta.env.PROD) return
    const check = async () => {
      if (await newVersionOut()) ready.current = true
    }
    const timer = setInterval(check, CHECK_MS)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (quiet && ready.current) location.reload()
  })
}
