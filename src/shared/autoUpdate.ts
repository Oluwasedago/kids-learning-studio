import { useEffect, useState } from 'react'

// New versions reach the tablet by themselves. Each start loads the newest page (public/sw.js: network first).
// An installed app can stay open for days, so once a day it also fetches its own start page and compares the
// app file named in it with the one it runs. When a new version is out, it reloads at the next quiet moment,
// never in the middle of a story, the radio or a film. The fetch says cache: 'no-store', which public/sw.js
// passes straight to the network: answered from the saved page it would never see a new version.

/** Once a day (the owner's choice, 24 Oct 2026). A start counts as a check: it loaded the newest page. */
const CHECK_MS = 24 * 60 * 60_000
/** How often the clock is looked at (no network): catches a tablet that slept through the 24 hours. */
const LOOK_MS = 60 * 60_000
const LAST_CHECK = 'kls-update-checked'

/** Is the daily check due? `last` = ms of the last check or start (NaN or 0 if never). Pure (tested). */
export const checkDue = (last: number, now: number) => !(now - last < CHECK_MS)

/** The app file a page names, e.g. "assets/app-B8eSRqwV.js" (with or without "./" or "/"). Pure (tested). */
export function appScript(html: string): string | null {
  return html.match(/assets\/(?:app|index)-[\w-]+\.js/)?.[0] ?? null
}

const running = () => appScript(document.documentElement.outerHTML)

/** The app file the deployed start page names; null when offline. */
async function latestScript(): Promise<string | null> {
  try {
    const res = await fetch('./', { cache: 'no-store' })
    return res.ok ? appScript(await res.text()) : null
  } catch {
    return null
  }
}

/** Is a newer version deployed? False when offline. */
export async function newVersionOut(): Promise<boolean> {
  const latest = await latestScript()
  const mine = running()
  return Boolean(latest && mine && latest !== mine)
}

/** The parents' "Update now" button: loads a newer version straight away, or says why not. */
export async function updateNow(): Promise<'reloading' | 'newest' | 'offline'> {
  const latest = await latestScript()
  if (!latest) return 'offline'
  if (latest === running()) return 'newest'
  location.reload()
  return 'reloading'
}

/** A film is open (the video player's frame is on screen). */
const filmOpen = () => document.querySelector('iframe.video-frame') !== null

/** Reloads into a new version once one is out and `quiet` is true (no touch for a while, nothing playing). */
export function useAutoUpdate(quiet: boolean) {
  // State, not a ref: finding a new version re-renders, so a Studio that is already quiet reloads straight away.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!import.meta.env.PROD) return
    localStorage.setItem(LAST_CHECK, String(Date.now()))
    const check = async () => {
      if (!checkDue(Number(localStorage.getItem(LAST_CHECK)), Date.now())) return
      localStorage.setItem(LAST_CHECK, String(Date.now()))
      if (await newVersionOut()) setReady(true)
    }
    const onShow = () => {
      if (document.visibilityState === 'visible') void check()
    }
    const timer = setInterval(check, LOOK_MS)
    document.addEventListener('visibilitychange', onShow)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [])
  // No dependency list: runs after every render, so closing a film lets a waiting update load.
  useEffect(() => {
    if (quiet && ready && !filmOpen()) location.reload()
  })
}
