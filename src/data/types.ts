import type { ItemId, Subject } from '@/access/catalogue'
import type { ThemeMode } from '@/shared/theme'

// The documents saved on the device (IndexedDB, see kv.ts). All three go into a backup file.
// Changing a shape later: add fields as optional, or give them a default in DEFAULT_SETTINGS / EMPTY_PROGRESS
// (useLocalDoc fills missing fields from the defaults), so older backups still restore.

/** Access control for one item. Layer 1: enabled (off = hidden). Layer 2: locked (opens with earned time) or unlocked. */
export interface AccessRule {
  enabled: boolean
  /** true = always open; false = locked until earned. */
  unlocked: boolean
  /** A parent unlocked it for this day only ("YYYY-MM-DD"). */
  unlockedOn?: string
}

export interface FamilyBirthday {
  id: string
  name: string
  /** 1-12 */
  month: number
  /** 1-31 */
  day: number
}

export interface Settings {
  /** The setup wizard has been finished (or a backup restored). */
  setupDone: boolean
  /** Sample data from "Try the demo"; leaving the demo deletes everything. */
  demo: boolean
  child: {
    /** First name or nickname, shown in the greeting. May stay empty. */
    name: string
    /** Birth month (1-12) and year only, never the day: enough to choose lessons by age. */
    birthMonth: number
    birthYear: number
    /** The child's colour (buttons, menu). */
    accent: string
  }
  theme: ThemeMode
  /** Reading aloud: the chosen voice (null = best available on the device) and speed. */
  voice: { name: string | null; rate: number }
  /** The parent PIN, stored only as a salted PBKDF2 hash (see parent/pin.ts). null until the wizard sets it. */
  pin: { salt: string; hash: string; iterations: number } | null
  access: Record<ItemId, AccessRule>
  rewards: {
    /** Missions a day (1-4). */
    missionsPerDay: number
    /** Questions in one mission (10, 25 or 50); a passed mission gives one star per 10 questions. */
    questionsPerMission: number
    /** Earned minutes per star. */
    minutesPerStar: number
    /** Most earned minutes in one day. */
    maxMinutesPerDay: number
    /** Stars needed this week for the weekly reward, and the reward (shown to the child as the goal). */
    weeklyGoal: number
    weeklyReward: string
  }
  report: {
    /** Where "Email report" sends to (opens the parent's own mail app). Empty = ask in the mail app. */
    email: string
    period: 'day' | 'week' | 'month'
  }
  birthdays: FamilyBirthday[]
  /** Extra radio stations a parent added (any HTTPS audio stream). */
  stations: { id: string; name: string; url: string }[]
  /** YouTube videos or playlists a parent picked (the only videos the child can play). */
  videos: { id: string; kind: 'video' | 'playlist'; title: string }[]
  /** One-tap calls: a name and a link (tel:, a WhatsApp or FaceTime link). */
  contacts: { id: string; name: string; link: string }[]
  backup: {
    /** ms since 1970 of the last backup file, or null. */
    lastAt: number | null
    /** Days after which the parent screen reminds to back up. */
    remindDays: number
  }
  updatedAt: number
}

/** A mission result: answers right out of all questions (one try per question). */
export interface Score {
  right: number
  total: number
}

/** A wrong answer, kept so parents can see what their child finds hard. */
export interface Mistake {
  /** "YYYY-MM-DD" */
  day: string
  subject: Subject
  /** The ladder step (skill) the question came from. */
  step: string
  prompt: string
  given: string
  answer: string
}

export interface Progress {
  /** Stars earned per day, "YYYY-MM-DD" → count. */
  stars: Record<string, number>
  /** Missions finished per day, "YYYY-MM-DD" → subjects. */
  missions: Record<string, string[]>
  /** Best score per subject per day. */
  scores: Record<string, Record<string, Score>>
  /** Every answer counted per day and skill step ("YYYY-MM-DD" → step id → right/total): for reports. */
  attempts: Record<string, Record<string, Score>>
  /** The most recent wrong answers (newest last, at most MAX_MISTAKES). */
  mistakes: Mistake[]
  /** Current step on each subject's skills ladder (index into lessons/ladder.ts). */
  levels: Partial<Record<Subject, number>>
  /** Recent results per subject (share right at first try, 0-1, newest last): drives the adaptive level. */
  recent: Partial<Record<Subject, number[]>>
  updatedAt: number
}

/** Seconds per area per day ("YYYY-MM-DD" → area → seconds). Areas: "mission:maths", "game:snake", "home"… */
export interface Usage {
  days: Record<string, Record<string, number>>
  /** Earned time used per day, in seconds. */
  earnedUsed: Record<string, number>
  updatedAt: number
}

export const ACCENTS = ['#5b6cf0', '#e2557e', '#178c84', '#e08a1e', '#8b5cf6', '#22a06b'] as const

export const DEFAULT_SETTINGS: Settings = {
  setupDone: false,
  demo: false,
  child: { name: '', birthMonth: 1, birthYear: new Date().getFullYear() - 6, accent: ACCENTS[0] },
  theme: 'system',
  voice: { name: null, rate: 0.9 },
  pin: null,
  // Filled by the setup wizard (access/starter.ts); this default only matters before the wizard has run.
  access: {} as Record<ItemId, AccessRule>,
  rewards: { missionsPerDay: 3, questionsPerMission: 10, minutesPerStar: 10, maxMinutesPerDay: 45, weeklyGoal: 12, weeklyReward: '' },
  report: { email: '', period: 'week' },
  birthdays: [],
  stations: [],
  videos: [],
  contacts: [],
  backup: { lastAt: null, remindDays: 7 },
  updatedAt: 0,
}

export const EMPTY_PROGRESS: Progress = { stars: {}, missions: {}, scores: {}, attempts: {}, mistakes: [], levels: {}, recent: {}, updatedAt: 0 }

export const MAX_MISTAKES = 200
export const EMPTY_USAGE: Usage = { days: {}, earnedUsed: {}, updatedAt: 0 }
