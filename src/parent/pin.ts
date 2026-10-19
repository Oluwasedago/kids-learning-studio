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
