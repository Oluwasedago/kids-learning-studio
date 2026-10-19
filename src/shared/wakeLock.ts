import { useEffect } from 'react'

// Keeps the screen on while the Studio is open (Screen Wake Lock API: Chrome, Android, Safari 16.4+;
// Fire/Silk to verify). `on` = false lets the screen sleep (e.g. at bedtime).

export function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        if (document.visibilityState !== 'visible') return
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) await lock.release()
      } catch {
        // Not allowed (e.g. battery saver): the screen follows the device's timeout.
      }
    }
    // The browser drops the lock when the page is hidden; take it again when it comes back.
    const onVisible = () => void acquire()
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [on])
}
