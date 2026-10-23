// The parent PIN is stored only as a salted PBKDF2-SHA-256 hash, never as the digits.
// PBKDF2 repeats the hash many times, so trying all 10,000 four-digit PINs from a copied backup file is slow.
// It keeps a child out of the parent screen; it is not meant to stop a determined adult with the device.

export const PIN_LENGTH = 4
export const PIN_ITERATIONS = 150_000

const hex = (bytes: ArrayBuffer | Uint8Array) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')

export function newSalt(): string {
  return hex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPin(pin: string, salt: string, iterations = PIN_ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations }, key, 256)
  return hex(bits)
}

export async function makePin(pin: string): Promise<{ salt: string; hash: string; iterations: number }> {
  const salt = newSalt()
  return { salt, hash: await hashPin(pin, salt), iterations: PIN_ITERATIONS }
}

export async function pinMatches(pin: string, stored: { salt: string; hash: string; iterations: number } | null): Promise<boolean> {
  if (!stored) return false
  return (await hashPin(pin, stored.salt, stored.iterations)) === stored.hash
}

// ---- A forgotten PIN ----
// There is no server, so no reset e-mail. Two ways back in instead:
// 1. The recovery code: shown once whenever a PIN is chosen, to write down or photograph. Stored only as a
//    hash, like the PIN. Typing it lets the parent choose a new PIN at once.
// 2. Without the code: "Forgot PIN" asks for a reset that is possible only after 24 hours. Until then the PIN
//    pad shows the request, and the right PIN cancels it, so a child who taps it cannot get in quickly and a
//    parent sees that it happened. (Someone who can change the device clock can shorten the wait.)

/** Letters and digits that cannot be mixed up when read from paper (no 0/O, 1/I/L). */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/** A new recovery code like "K7QM-3XRT-9PWA" (12 characters, about 59 bits). */
export function newRecoveryCode(): string {
  const n = crypto.getRandomValues(new Uint8Array(12))
  const chars = [...n].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`
}

/** The code as typed, made comparable: capitals, without spaces or dashes. */
export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^0-9A-Z]/g, '')

/** How long a reset without the recovery code waits. */
export const RESET_WAIT_MS = 24 * 60 * 60 * 1000

/** When a requested reset becomes possible (ms since 1970). */
export const resetReadyAt = (requestedAt: number) => requestedAt + RESET_WAIT_MS
