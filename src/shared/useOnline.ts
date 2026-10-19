import { useEffect, useState } from 'react'

// Online or offline for the status bar. A browser cannot read Wi-Fi strength, so this is yes/no only.

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    addEventListener('online', update)
    addEventListener('offline', update)
    return () => {
      removeEventListener('online', update)
      removeEventListener('offline', update)
    }
  }, [])
  return online
}
