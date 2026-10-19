import { useEffect, useState } from 'react'

// The battery for the status bar, from the browser's Battery Status API. Only Chromium browsers have it
// (Chrome, Android, probably Fire's Silk – to verify); Safari/iPad does not, so nothing is shown there.

export interface BatteryState {
  /** 0-100 */
  level: number
  charging: boolean
}

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
}

export function useBattery(): BatteryState | null {
  const [state, setState] = useState<BatteryState | null>(null)

  useEffect(() => {
    let cancelled = false
    let manager: BatteryManager | null = null
    const update = () => manager && !cancelled && setState({ level: Math.round(manager.level * 100), charging: manager.charging })
    const getBattery = (navigator as unknown as { getBattery?: () => Promise<BatteryManager> }).getBattery
    getBattery
      ?.call(navigator)
      .then((m) => {
        manager = m
        update()
        m.addEventListener('levelchange', update)
        m.addEventListener('chargingchange', update)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      manager?.removeEventListener('levelchange', update)
      manager?.removeEventListener('chargingchange', update)
    }
  }, [])

  return state
}
