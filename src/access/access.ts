import type { AccessRule, Progress, Settings, Usage } from '@/data/types'
import { ITEM_IDS, ITEMS, type ItemId } from './catalogue'

// Two-layer access control (product map, section 2). Pure functions, tested in access.test.ts.
//
//   Layer 1 · Enable (parent PIN):  off → hidden, the child never sees the item.
//   Layer 2 · Access:               unlocked → open;
//                                   locked   → open only while earned time is left (missions → stars → minutes),
//                                              or when a parent unlocked it for today.

export type AccessState = 'hidden' | 'locked' | 'earned' | 'unlocked'

/** The state of one item now. `earnedSecondsLeft` is today's earned time not yet used. */
export function accessState(rule: AccessRule | undefined, today: string, earnedSecondsLeft: number): AccessState {
  if (!rule?.enabled) return 'hidden'
  if (rule.unlocked || rule.unlockedOn === today) return 'unlocked'
  return earnedSecondsLeft > 0 ? 'earned' : 'locked'
}

/** Can the child open it now? */
export const isOpen = (s: AccessState) => s === 'unlocked' || s === 'earned'

/** Minutes earned on a day: stars × minutes per star, at most the daily limit. */
export function earnedMinutes(progress: Progress, rewards: Settings['rewards'], day: string): number {
  return Math.min(rewards.maxMinutesPerDay, (progress.stars[day] ?? 0) * rewards.minutesPerStar)
}

/** Earned seconds still left on a day. */
export function earnedSecondsLeft(progress: Progress, usage: Usage, rewards: Settings['rewards'], day: string): number {
  return Math.max(0, earnedMinutes(progress, rewards, day) * 60 - (usage.earnedUsed[day] ?? 0))
}

/**
 * The setup wizard's proposal for a child's age: everything suitable switched on, learning and listening
 * open, games and videos locked until earned.
 */
export function starterAccess(age: number): Record<ItemId, AccessRule> {
  const out = {} as Record<ItemId, AccessRule>
  for (const id of ITEM_IDS) {
    const item = ITEMS[id]
    out[id] = { enabled: age >= item.minAge, unlocked: item.starter === 'unlocked' }
  }
  return out
}

/** A parent's choice on the parent screen or behind a locked tile. */
export type AccessChange = 'enable' | 'disable' | 'lock' | 'unlock' | 'unlockToday'

export function changeAccess(rule: AccessRule | undefined, change: AccessChange, today: string): AccessRule {
  const r: AccessRule = rule ?? { enabled: false, unlocked: false }
  switch (change) {
    case 'enable':
      return { ...r, enabled: true }
    case 'disable':
      return { ...r, enabled: false }
    case 'lock':
      return { enabled: r.enabled, unlocked: false }
    case 'unlock':
      return { enabled: r.enabled, unlocked: true }
    case 'unlockToday':
      return { ...r, unlockedOn: today }
  }
}
