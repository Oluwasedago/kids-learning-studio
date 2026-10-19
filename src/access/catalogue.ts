// Everything a parent can switch on or off (access control layer 1) and lock or unlock (layer 2).
// To add an item: add it here, give it a name in i18n/en.ts (items.<id>), and show it on its screen.

export type ItemGroup = 'learning' | 'games' | 'media' | 'family'

export const ITEM_IDS = [
  // Learning: the mission subjects.
  'maths',
  'english',
  'world',
  'patterns',
  // Our own games.
  'memory',
  'builder',
  'puzzle',
  'snake',
  // Listening and watching (screens arrive in Step 3).
  'radio',
  'stories',
  'videos',
  'faith',
  // Family.
  'calls',
] as const

export type ItemId = (typeof ITEM_IDS)[number]

export interface Item {
  id: ItemId
  group: ItemGroup
  emoji: string
  /** The screen exists in this version (otherwise the parent screen shows it as coming soon). */
  ready: boolean
  /** Youngest age the setup wizard switches it on for. */
  minAge: number
  /**
   * Starter setting from the wizard: 'unlocked' is always open once enabled (learning, calls);
   * 'locked' opens with earned time (games, videos).
   */
  starter: 'locked' | 'unlocked'
  /** Optional modules start switched off; the parent chooses them (e.g. faith). */
  optIn?: boolean
}

export const ITEMS: Record<ItemId, Item> = {
  maths: { id: 'maths', group: 'learning', emoji: 'abacus', ready: true, minAge: 4, starter: 'unlocked' },
  english: { id: 'english', group: 'learning', emoji: 'letters', ready: true, minAge: 4, starter: 'unlocked' },
  world: { id: 'world', group: 'learning', emoji: 'globe', ready: true, minAge: 5, starter: 'unlocked' },
  patterns: { id: 'patterns', group: 'learning', emoji: 'puzzle', ready: true, minAge: 4, starter: 'unlocked' },
  memory: { id: 'memory', group: 'games', emoji: 'joystick', ready: true, minAge: 4, starter: 'locked' },
  builder: { id: 'builder', group: 'games', emoji: 'memo', ready: true, minAge: 5, starter: 'locked' },
  puzzle: { id: 'puzzle', group: 'games', emoji: 'framed', ready: true, minAge: 4, starter: 'locked' },
  snake: { id: 'snake', group: 'games', emoji: 'snake', ready: true, minAge: 6, starter: 'locked' },
  radio: { id: 'radio', group: 'media', emoji: 'radio', ready: false, minAge: 4, starter: 'unlocked' },
  stories: { id: 'stories', group: 'media', emoji: 'openbook', ready: false, minAge: 4, starter: 'unlocked' },
  videos: { id: 'videos', group: 'media', emoji: 'tv', ready: false, minAge: 4, starter: 'locked' },
  faith: { id: 'faith', group: 'media', emoji: 'candle', ready: false, minAge: 4, starter: 'unlocked', optIn: true },
  calls: { id: 'calls', group: 'family', emoji: 'speech', ready: false, minAge: 4, starter: 'unlocked' },
}

export const GROUPS: ItemGroup[] = ['learning', 'games', 'media', 'family']

export const itemsIn = (group: ItemGroup) => ITEM_IDS.filter((id) => ITEMS[id].group === group)

/** The subjects missions are drawn from. */
export const SUBJECTS = ['maths', 'english', 'world', 'patterns'] as const satisfies readonly ItemId[]
export type Subject = (typeof SUBJECTS)[number]
