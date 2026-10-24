import type { Word } from '@/lessons/data'
import { shuffled } from '@/lessons/question'

// Word builder: a picture and its word's letters mixed up; the child taps them in order. It adapts: words grow
// longer after three rounds without a wrong tap and shorter after a hard one, and long words get extra letters that
// do not belong. Pure (builder.test.ts).

export interface Round {
  word: Word
  /** The word to build, in capitals: "FOX". */
  target: string
  /** The letter tiles, mixed up (never already in order for words with different letters). */
  tiles: string[]
}

const MAX_LETTERS = 12
/** Word length a child starts with, and the limits it moves between. */
export const START_LENGTH = 4
export const MIN_LENGTH = 3
export const MAX_LENGTH = MAX_LETTERS

/** Words that fit: one word, letters only, at most 12 letters. */
export const playable = (words: Word[]) => words.filter((w) => /^[a-z]+$/.test(w.word) && w.word.length <= MAX_LETTERS)

/** The next word length: one longer after three clean rounds in a row, one shorter after 3+ wrong taps. Pure (tested). */
export function nextLength(length: number, cleanRun: number, mistakes: number): { length: number; cleanRun: number } {
  if (mistakes >= 3) return { length: Math.max(MIN_LENGTH, length - 1), cleanRun: 0 }
  const run = mistakes === 0 ? cleanRun + 1 : 0
  if (run >= 3) return { length: Math.min(MAX_LENGTH, length + 1), cleanRun: 0 }
  return { length, cleanRun: run }
}

/** A word of about that length (up to two letters shorter), never the one just played. Pure with a given random. */
export function pickWord(words: Word[], length: number, random = Math.random, last?: Word): Word {
  const fit = (w: Word, below: number) => w.word.length <= length && w.word.length >= length - below && w !== last
  const pool = words.filter((w) => fit(w, 2))
  const wider = pool.length > 0 ? pool : words.filter((w) => fit(w, 12))
  const list = wider.length > 0 ? wider : words
  return list[Math.floor(random() * list.length)]
}

/** Letters that do not belong, for long words (one for 7 letters or more, two for 10 or more). */
export const decoysFor = (length: number) => (length >= 10 ? 2 : length >= 7 ? 1 : 0)

export function newRound(word: Word, random = Math.random, decoys = 0): Round {
  const target = word.word.toUpperCase()
  const spare = [...'AEIOURSTLNMK'].filter((c) => !target.includes(c))
  const letters = [...target, ...shuffled(spare, random).slice(0, decoys)]
  let tiles = shuffled(letters, random)
  for (let i = 0; i < 5 && tiles.join('') === target && new Set(letters).size > 1; i++) tiles = shuffled(letters, random)
  return { word, target, tiles }
}

/** Is `letter` the next right one after `built` letters? */
export const nextIs = (round: Round, built: string, letter: string) => round.target[built.length] === letter
