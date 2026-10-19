import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, EMPTY_PROGRESS, EMPTY_USAGE } from '@/data/types'
import { accessState, changeAccess, earnedMinutes, earnedSecondsLeft, isOpen, starterAccess } from './access'

const today = '2026-10-19'
const rewards = { ...DEFAULT_SETTINGS.rewards, minutesPerStar: 10, maxMinutesPerDay: 25 }

describe('access control', () => {
  it('layer 1: a switched-off or unknown item is hidden', () => {
    expect(accessState(undefined, today, 999)).toBe('hidden')
    expect(accessState({ enabled: false, unlocked: true }, today, 999)).toBe('hidden')
  })
  it('layer 2: unlocked is open; locked opens only with earned time', () => {
    expect(accessState({ enabled: true, unlocked: true }, today, 0)).toBe('unlocked')
    expect(accessState({ enabled: true, unlocked: false }, today, 0)).toBe('locked')
    expect(accessState({ enabled: true, unlocked: false }, today, 60)).toBe('earned')
    expect(isOpen('earned') && isOpen('unlocked') && !isOpen('locked') && !isOpen('hidden')).toBe(true)
  })
  it('a parent unlock for today ends at midnight', () => {
    const rule = changeAccess({ enabled: true, unlocked: false }, 'unlockToday', today)
    expect(accessState(rule, today, 0)).toBe('unlocked')
    expect(accessState(rule, '2026-10-20', 0)).toBe('locked')
  })
  it('locking again clears a today-unlock; disabling keeps the lock setting', () => {
    const r = changeAccess({ enabled: true, unlocked: true, unlockedOn: today }, 'lock', today)
    expect(r).toEqual({ enabled: true, unlocked: false })
    expect(changeAccess(r, 'disable', today)).toEqual({ enabled: false, unlocked: false })
  })
  it('earned time: stars × minutes, capped per day, minus what was used', () => {
    const progress = { ...EMPTY_PROGRESS, stars: { [today]: 3 } }
    expect(earnedMinutes(progress, rewards, today)).toBe(25)
    const usage = { ...EMPTY_USAGE, earnedUsed: { [today]: 20 * 60 } }
    expect(earnedSecondsLeft(progress, usage, rewards, today)).toBe(5 * 60)
    expect(earnedSecondsLeft(progress, { ...usage, earnedUsed: { [today]: 99_999 } }, rewards, today)).toBe(0)
  })
  it('starter set by age: learning open, games locked, too-young items off', () => {
    const four = starterAccess(4)
    expect(four.maths).toEqual({ enabled: true, unlocked: true })
    expect(four.memory).toEqual({ enabled: true, unlocked: false })
    expect(four.snake.enabled).toBe(false)
    expect(four.facts).toEqual({ enabled: true, unlocked: true })
    expect(starterAccess(7).snake.enabled).toBe(true)
  })
})
