import { isoDate } from '@/shared/date'
import { kvClear, kvGet, kvKeys, kvSet } from './kv'
import type { Settings } from './types'

// Backup and Restore: everything the app keeps on the device in one JSON file, kept by the parent (Files,
// Drive, email to themselves…). Restoring replaces everything on this device. The file holds the child's
// first name, birth month and year, progress and the hashed parent PIN, so it should be kept private.

export const BACKUP_APP = 'kids-learning-studio'
export const BACKUP_FORMAT = 1
/** The documents a backup may contain (anything else in a file is ignored). */
export const BACKUP_KEYS = ['settings', 'progress', 'usage'] as const

export interface BackupFile {
  app: typeof BACKUP_APP
  format: number
  exportedAt: string
  data: Partial<Record<(typeof BACKUP_KEYS)[number], unknown>>
}

/** Collects everything into a backup, with the backup time already set in the copied settings. */
export async function makeBackup(now = new Date()): Promise<BackupFile> {
  const data: BackupFile['data'] = {}
  for (const key of await kvKeys()) {
    if (!(BACKUP_KEYS as readonly string[]).includes(key)) continue
    data[key as (typeof BACKUP_KEYS)[number]] = await kvGet(key)
  }
  const settings = data.settings as Settings | undefined
  if (settings) data.settings = { ...settings, backup: { ...settings.backup, lastAt: now.getTime() } }
  return { app: BACKUP_APP, format: BACKUP_FORMAT, exportedAt: now.toISOString(), data }
}

export const backupFileName = (now = new Date()) => `kids-learning-studio-${isoDate(now)}.backup.json`

/**
 * Hands the backup file to the parent: the share sheet where the device has one for files (iPad, Android),
 * otherwise a normal download. Returns false when the parent cancelled sharing.
 */
export async function saveBackup(backup: BackupFile, now = new Date()): Promise<boolean> {
  const json = JSON.stringify(backup, null, 1)
  const name = backupFileName(now)
  const file = new File([json], name, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return true
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false
      // Sharing failed for another reason: fall back to a download.
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}

export class BackupError extends Error {}

/** Reads and checks a backup file's text. Throws BackupError with a reason the parent can act on. Pure (tested). */
export function parseBackup(text: string): BackupFile {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupError('not-json')
  }
  const b = raw as Partial<BackupFile>
  if (!b || typeof b !== 'object' || b.app !== BACKUP_APP) throw new BackupError('not-ours')
  if (typeof b.format !== 'number' || b.format > BACKUP_FORMAT) throw new BackupError('too-new')
  if (!b.data || typeof b.data !== 'object') throw new BackupError('empty')
  const settings = b.data.settings as Partial<Settings> | undefined
  if (!settings || typeof settings !== 'object' || typeof settings.updatedAt !== 'number') throw new BackupError('empty')
  const data: BackupFile['data'] = {}
  for (const key of BACKUP_KEYS) if (b.data[key] && typeof b.data[key] === 'object') data[key] = b.data[key]
  return { app: BACKUP_APP, format: b.format, exportedAt: String(b.exportedAt ?? ''), data }
}

/** Replaces everything on this device with the backup. The page should reload afterwards. */
export async function restoreBackup(b: BackupFile): Promise<void> {
  await kvClear()
  for (const key of BACKUP_KEYS) if (b.data[key] !== undefined) await kvSet(key, b.data[key])
}

/** Deletes everything on this device (leaving the demo, or "Delete all data"). The page should reload afterwards. */
export const deleteAll = () => kvClear()

/** Is a backup due? Never made yet, or older than the reminder interval. Not in the demo. Pure (tested). */
export function backupDue(s: Settings, now: Date): boolean {
  if (!s.setupDone || s.demo) return false
  if (s.backup.lastAt === null) return true
  return now.getTime() - s.backup.lastAt > s.backup.remindDays * 86_400_000
}
