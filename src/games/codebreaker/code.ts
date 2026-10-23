import type { Lang } from '@/i18n'
import { shuffled } from '@/lessons/question'

// Code breaker: a secret message written in a code; the child decodes it letter by letter with the key.
//   - picture code: every letter is a picture; the key shows which picture means which letter (younger children)
//   - number code: A = 1, B = 2 … Z = 26; the key shows the alphabet with numbers (older children)
// Each round uses a new random picture key. Messages are short, friendly sentences in the app language.
// Pure (code.test.ts).

export type CodeMode = 'pictures' | 'numbers'

/** Pictures used as code symbols (all in public/emoji, all easy to tell apart). */
export const SYMBOLS = [
  'star', 'heart', 'sun', 'moon', 'snowflake', 'fire', 'fruit-apple', 'fruit-banana', 'fruit-cherries', 'fruit-grapes',
  'fruit-lemon', 'fruit-strawberry', 'fruit-watermelon', 'animal-fox', 'animal-frog', 'animal-owl', 'animal-penguin',
  'animal-lion', 'animal-octopus', 'animal-turtle', 'animal-butterfly', 'bell', 'gift', 'umbrella', 'rain', 'cake',
  'bus', 'house', 'music', 'light', 'snowman', 'trophy',
] as const

/** The secret messages: short, kind, true for anyone. Capitals are added when coding. */
export const MESSAGES: Record<Lang, string[]> = {
  en: [
    'you are a star', 'reading is fun', 'well done', 'keep trying', 'you can do it', 'be kind', 'books are magic',
    'learning is cool', 'let us play', 'have a nice day', 'you are clever', 'the sun is hot', 'cats like naps',
    'brave and kind', 'great job', 'high five', 'never give up', 'smile today', 'you are amazing', 'friends help',
  ],
  de: [
    'du bist toll', 'lesen macht spass', 'gut gemacht', 'weiter so', 'du schaffst das', 'sei nett', 'buecher sind toll',
    'lernen ist cool', 'lass uns spielen', 'hab einen schoenen tag', 'du bist klug', 'die sonne ist heiss',
    'katzen schlafen gern', 'mutig und nett', 'super gemacht', 'gib nie auf', 'heute lachen wir', 'du bist spitze',
    'freunde helfen', 'klasse arbeit',
  ],
  fr: [
    'tu es une star', 'lire est amusant', 'bien joue', 'continue comme ca', 'tu peux le faire', 'sois gentil',
    'les livres sont magiques', 'apprendre est cool', 'on va jouer', 'bonne journee', 'tu es malin', 'le soleil brille',
    'les chats dorment', 'courage et gentillesse', 'super travail', 'tope la', 'ne lache rien', 'garde le sourire',
    'tu es genial', 'les amis aident',
  ],
}
// German messages are written without ä, ö, ü and ß (ue, oe, ss) and French ones without accents, so every
// letter is one of the 26 of the number code. They stay correct spellings of the same words.

export interface Cell {
  /** The letter (capital) or a space. */
  char: string
  /** The code for it: a picture name or a number; null for a space. */
  code: string | null
}

export interface Puzzle {
  message: string
  cells: Cell[]
  /** The key, letter → code, for the letters in the message plus a few more (so the key is not the answer). */
  key: { letter: string; code: string }[]
  /** The letter buttons: every letter of the message and a few others, in a mixed order. */
  keyboard: string[]
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function makePuzzle(message: string, mode: CodeMode, random = Math.random): Puzzle {
  const text = message.toUpperCase()
  const letters = [...new Set([...text].filter((c) => ALPHABET.includes(c)))]
  const extra = shuffled([...ALPHABET].filter((c) => !letters.includes(c)), random).slice(0, Math.min(4, 26 - letters.length))
  const inKey = [...letters, ...extra]
  const symbols = shuffled([...SYMBOLS], random)
  const codeOf = new Map(inKey.map((c, i) => [c, mode === 'numbers' ? String(ALPHABET.indexOf(c) + 1) : symbols[i]]))
  return {
    message: text,
    cells: [...text].map((char) => ({ char, code: codeOf.get(char) ?? null })),
    key: (mode === 'numbers' ? [...ALPHABET].map((c) => ({ letter: c, code: String(ALPHABET.indexOf(c) + 1) })) : shuffled(inKey, random).map((c) => ({ letter: c, code: codeOf.get(c)! }))),
    keyboard: shuffled(inKey, random),
  }
}

/** The next cell to decode (skipping spaces), or -1 when the message is complete. */
export const nextCell = (p: Puzzle, solved: number) => p.cells.findIndex((c, i) => i >= solved && c.code !== null)

/** Messages in a new random order. */
export const messageOrder = (lang: Lang, random = Math.random) => shuffled(MESSAGES[lang], random)
