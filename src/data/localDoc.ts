import { useCallback, useEffect, useRef, useState } from 'react'
import { kvGet, kvSet } from './kv'

// A document kept on this device only (settings, progress). Replaces the private version's "synced" document,
// which also copied it to a server: here there is no server; Backup/Restore moves data between devices.

type Doc = { updatedAt: number }

/** `fallback` also fills fields a stored copy does not have yet (e.g. a setting added in a later version). */
export function useLocalDoc<T extends Doc>(key: string, fallback: T) {
  const [doc, setDoc] = useState<T>(fallback)
  const [ready, setReady] = useState(false)
  const latest = useRef(doc)

  useEffect(() => {
    let cancelled = false
    void kvGet<T>(key).then((stored) => {
      if (cancelled) return
      const next = { ...fallback, ...stored }
      latest.current = next
      setDoc(next)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
    // `fallback` is a constant default; reading it once is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  /** Changes the document: `change` gets the current copy and returns the new one; updatedAt is set here. */
  const update = useCallback(
    (change: (current: T) => T) => {
      const next = { ...change(latest.current), updatedAt: Date.now() }
      latest.current = next
      setDoc(next)
      void kvSet(key, next)
    },
    [key],
  )

  return { doc, ready, update }
}
