import { useEffect, useState } from 'react'

/** True after `ms` without a touch or key; any touch makes it false again. */
export function useIdle(ms: number): boolean {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), ms)
    const reset = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), ms)
    }
    addEventListener('pointerdown', reset, true)
    addEventListener('keydown', reset, true)
    return () => {
      clearTimeout(timer)
      removeEventListener('pointerdown', reset, true)
      removeEventListener('keydown', reset, true)
    }
  }, [ms])
  return idle
}
