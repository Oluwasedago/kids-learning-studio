import { starterAccess } from '@/access/access'
import { SUBJECTS } from '@/access/catalogue'
import { kvSet } from '@/data/kv'
import { DEFAULT_SETTINGS, EMPTY_PROGRESS, EMPTY_USAGE, type Progress, type Settings, type Usage } from '@/data/types'
import { startLevel } from '@/lessons/ladder'
import { makePin } from '@/parent/pin'
import { missionsFor } from '@/progress/progress'
import { addDays, isoDate } from '@/shared/date'

// "Try the demo": a made-up child with twelve days of sample progress, so parents can look around before setting up.
// The demo parent PIN is shown on the demo banner. Leaving the demo deletes everything.

export const DEMO_PIN = '1234'
export const DEMO_AGE = 7

export async function makeDemo(now = new Date()): Promise<{ settings: Settings; progress: Progress; usage: Usage }> {
  const access = starterAccess(DEMO_AGE)
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    setupDone: true,
    demo: true,
    child: { name: 'Sam', birthMonth: now.getMonth() + 1, birthYear: now.getFullYear() - DEMO_AGE, accent: '#178c84' },
    pin: await makePin(DEMO_PIN),
    access,
    rewards: { ...DEFAULT_SETTINGS.rewards, weeklyReward: 'Trip to the park' },
    birthdays: [{ id: 'demo-1', name: 'Grandma', month: addDays(now, 9).getMonth() + 1, day: addDays(now, 9).getDate() }],
    backup: { lastAt: null, remindDays: 7 },
    updatedAt: now.getTime(),
  }

  const progress: Progress = { ...EMPTY_PROGRESS, levels: {}, updatedAt: now.getTime() }
  const usage: Usage = { ...EMPTY_USAGE, updatedAt: now.getTime() }
  // Twelve days back, skipping one (covered by a streak freeze earned after 7 days in a row): 2–3 missions a
  // day with mixed scores, some games with earned time.
  for (let i = 12; i >= 1; i--) {
    if (i === 3) continue
    const d = addDays(now, -i)
    const day = isoDate(d)
    const missions = missionsFor(d, access, 3).slice(0, i % 3 === 0 ? 2 : 3)
    progress.missions[day] = missions
    progress.stars[day] = missions.length
    progress.scores[day] = Object.fromEntries(missions.map((m, k) => [m, { right: 5 + ((i + k) % 4), total: 8 }]))
    usage.days[day] = { home: 180, ...Object.fromEntries(missions.map((m) => [`mission:${m}`, 240 + 30 * (i % 3)])), 'game:memory': 600, 'game:snake': 300 }
    usage.earnedUsed[day] = 900
    // Every answer per skill: subtraction is hard for the demo child, so the report shows it under "Needs help".
    progress.attempts[day] = { 'add-sub-20': { right: 3, total: 8 }, 'missing-letter': { right: 7, total: 8 }, 'easy-flags': { right: 6, total: 8 } }
  }
  progress.mistakes = [
    { day: isoDate(addDays(now, -2)), subject: 'maths', step: 'add-sub-20', prompt: 'What is 15 − 7?', given: '9', answer: '8' },
    { day: isoDate(addDays(now, -2)), subject: 'maths', step: 'add-sub-20', prompt: 'What is 12 − 5?', given: '8', answer: '7' },
    { day: isoDate(addDays(now, -1)), subject: 'maths', step: 'add-sub-20', prompt: 'What is 13 − 6?', given: '8', answer: '7' },
    { day: isoDate(addDays(now, -1)), subject: 'world', step: 'easy-flags', prompt: 'Which country has this flag?', given: 'Italy', answer: 'Ireland' },
  ]
  for (const s of SUBJECTS) progress.levels[s] = startLevel(s, DEMO_AGE) + 1
  return { settings, progress, usage }
}

/** Saves the demo data and reloads into it (without "?demo" in the address). */
export async function startDemo() {
  const d = await makeDemo()
  await kvSet('settings', d.settings)
  await kvSet('progress', d.progress)
  await kvSet('usage', d.usage)
  const url = new URL(location.href)
  url.searchParams.delete('demo')
  location.replace(url)
}
