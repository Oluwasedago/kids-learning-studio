// Which kind of device opened the install page, from the browser's user agent. Pure (tested).

export type Device = 'fire' | 'android' | 'ipad' | 'iphone' | 'computer'

export const DEVICES: Device[] = ['fire', 'android', 'ipad', 'iphone', 'computer']

/**
 * Fire tablets: the Silk browser or a Fire model code (KF…). iPads on iPadOS 13+ say "Macintosh", so a Mac
 * user agent with a touch screen counts as an iPad.
 */
export function detectDevice(ua: string, maxTouchPoints = 0): Device {
  if (/\bSilk\b|\bKF[A-Z]{2,6}\b|Kindle/.test(ua)) return 'fire'
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPod/.test(ua)) return 'iphone'
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return 'ipad'
  return 'computer'
}
