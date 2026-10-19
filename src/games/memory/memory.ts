import { shuffled } from '@/lessons/question'
import type { Word } from '@/lessons/data'

// Memory: find the pairs. Pictures: picture and picture. Words: picture and its word (reading practice).
// Pure (memory.test.ts).

export type MemoryMode = 'pictures' | 'words'

export interface MemoryCard {
  /** Position on the board. */
  key: number
  /** Cards with the same pair id belong together. */
  pair: number
  emoji: string
  /** Shown instead of the picture on a word card. */
  text?: string
}

/** A shuffled board of `pairs` pairs. */
export function newBoard(words: Word[], pairs: number, mode: MemoryMode, random = Math.random): MemoryCard[] {
  const chosen = shuffled(words, random).slice(0, pairs)
  const cards = chosen.flatMap((w, pair) => [
    { pair, emoji: w.emoji },
    { pair, emoji: w.emoji, text: mode === 'words' ? w.word : undefined },
  ])
  return shuffled(cards, random).map((c, key) => ({ ...c, key }))
}

/** Two open cards match when they are different cards of the same pair. */
export const isMatch = (a: MemoryCard, b: MemoryCard) => a.key !== b.key && a.pair === b.pair
