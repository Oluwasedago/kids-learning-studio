import type { Word } from '@/lessons/data'
import { shuffled } from '@/lessons/question'

// Word builder: a picture and its word's letters mixed up; the child taps them in order. Short single words
// only. Pure (builder.test.ts).

export interface Round {
  word: Word
  /** The word to build, in capitals: "FOX". */
  target: string
  /** The letter tiles, mixed up (never already in order for words with different letters). */
  tiles: string[]
}

const MAX_LETTERS = 8

/** Words that fit: one word, letters only, at most 8 letters. */
export const playable = (words: Word[]) => words.filter((w) => /^[a-z]+$/.test(w.word) && w.word.length <= MAX_LETTERS)

export function newRound(word: Word, random = Math.random): Round {
  const target = word.word.toUpperCase()
  const letters = [...target]
  let tiles = shuffled(letters, random)
  for (let i = 0; i < 5 && tiles.join('') === target && new Set(letters).size > 1; i++) tiles = shuffled(letters, random)
  return { word, target, tiles }
}

/** Is `letter` the next right one after `built` letters? */
export const nextIs = (round: Round, built: string, letter: string) => round.target[built.length] === letter
