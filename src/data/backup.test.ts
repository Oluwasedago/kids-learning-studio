import { describe, expect, it } from 'vitest'
import { BACKUP_APP, BackupError, backupDue, parseBackup } from './backup'
import { DEFAULT_SETTINGS } from './types'

const settings = { ...DEFAULT_SETTINGS, setupDone: true, updatedAt: 5 }
const file = (over: object = {}) => JSON.stringify({ app: BACKUP_APP, format: 1, exportedAt: '2026-10-19T10:00:00Z', data: { settings, progress: { stars: {}, updatedAt: 1 } }, ...over })
const reason = (text: string) => {
  try {
    parseBackup(text)
    return 'ok'
  } catch (e) {
    return e instanceof BackupError ? e.message : 'other'
  }
}

describe('backup', () => {
  it('reads a good file and drops unknown keys', () => {
    const b = parseBackup(file({ data: { settings, progress: { updatedAt: 1 }, evil: { x: 1 } } }))
    expect(Object.keys(b.data).sort()).toEqual(['progress', 'settings'])
  })
  it('explains what is wrong with a bad file', () => {
    expect(reason('not json')).toBe('not-json')
    expect(reason(JSON.stringify({ app: 'something-else' }))).toBe('not-ours')
    expect(reason(file({ format: 99 }))).toBe('too-new')
    expect(reason(file({ data: {} }))).toBe('empty')
  })
  it('reminds when no backup was made, or the last one is too old; never in the demo', () => {
    const now = new Date(2026, 9, 19)
    expect(backupDue(settings, now)).toBe(true)
    expect(backupDue({ ...settings, backup: { lastAt: now.getTime() - 2 * 86_400_000, remindDays: 7 } }, now)).toBe(false)
    expect(backupDue({ ...settings, backup: { lastAt: now.getTime() - 8 * 86_400_000, remindDays: 7 } }, now)).toBe(true)
    expect(backupDue({ ...settings, demo: true }, now)).toBe(false)
    expect(backupDue({ ...settings, setupDone: false }, now)).toBe(false)
  })
})
