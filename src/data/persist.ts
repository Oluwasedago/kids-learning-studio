import { useEffect, useState } from 'react'

// Asks the browser to keep this site's data (persistent storage). Without it, a browser may delete the data of
// sites not used for a while or when the device runs low on space. Browsers decide differently:
//   - Chrome / Android / Fire (Silk is Chromium-based): usually granted for an installed app (assumed; verify on Fire).
//   - Safari / iPad: data of an app added to the home screen is kept; persist() may still answer false (to verify).
// Backups (Step 2) are the safety net either way.

export type PersistState = 'persisted' | 'not-persisted' | 'unsupported'

export async function requestPersistence(): Promise<PersistState> {
  const storage = globalThis.navigator?.storage
  if (!storage?.persist || !storage.persisted) return 'unsupported'
  try {
    if (await storage.persisted()) return 'persisted'
    return (await storage.persist()) ? 'persisted' : 'not-persisted'
  } catch {
    return 'unsupported'
  }
}

/** Space used by this site in MB (one decimal), or null when the browser does not say. */
export async function usedMegabytes(): Promise<string | null> {
  try {
    const est = await navigator.storage?.estimate?.()
    return est?.usage === undefined ? null : (est.usage / 1_000_000).toFixed(1)
  } catch {
    return null
  }
}

/** Requests persistence once at start and reports the answer and the space used. */
export function usePersistence() {
  const [state, setState] = useState<PersistState | null>(null)
  const [usedMb, setUsedMb] = useState<string | null>(null)
  useEffect(() => {
    void requestPersistence().then(setState)
    void usedMegabytes().then(setUsedMb)
  }, [])
  return { state, usedMb }
}
