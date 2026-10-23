import { A_AN, COMMON_WORDS, OPPOSITES, PAST_TENSES, PLURALS, WORDS } from './data'
import { others, pick, type Question, type Random, shuffled, shuffleIn } from './question'
import type { Step } from './step'

// English ladder: letters and sounds → reading words → spelling → grammar (a/an, plurals, past tense) → vocabulary.

/** Simple words (one word, letters only) up to `max` letters. */
const wordsUpTo = (max: number) => WORDS.filter((w) => /^[a-z]+$/.test(w.word) && w.word.length <= max)

const LETTERS = 'abcdefghijklmnoprstw'.split('')
const VOWELS = 'aeiou'.split('')
const CONSONANTS = 'bdfgklmnprst'.split('')

/** Wrong spellings a child might write: a dropped letter, a doubled letter, two letters swapped, a vowel changed. Pure (tested). */
export function misspellings(word: string, r: Random, count = 2): string[] {
  const vowels = 'aeiou'
  const makers: ((w: string) => string)[] = [
    (w) => {
      const i = 1 + Math.floor(r() * (w.length - 1))
      return w.slice(0, i) + w.slice(i + 1)
    },
    (w) => {
      const i = Math.floor(r() * w.length)
      return w.slice(0, i + 1) + w[i] + w.slice(i + 1)
    },
    (w) => {
      const i = 1 + Math.floor(r() * (w.length - 2))
      return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)
    },
    (w) => {
      const at = [...w].map((c, i) => (vowels.includes(c) ? i : -1)).filter((i) => i >= 0)
      if (at.length === 0) return w
      const i = pick(r, at)
      const v = pick(r, [...vowels].filter((x) => x !== w[i]))
      return w.slice(0, i) + v + w.slice(i + 1)
    },
  ]
  const out: string[] = []
  for (let guard = 0; out.length < count && guard < 50; guard++) {
    const m = pick(r, makers)(word)
    if (m !== word && m.length > 1 && !out.includes(m)) out.push(m)
  }
  return out
}

function firstLetter(r: Random): Question {
  const w = pick(r, wordsUpTo(9))
  const first = w.word[0]
  return {
    prompt: `Which letter does "${w.word}" start with?`,
    visual: { kind: 'emoji', name: w.emoji },
    ...shuffleIn(r, { label: first }, others(r, LETTERS, first).map((l) => ({ label: l }))),
  }
}

function matchWord(r: Random): Question {
  const pool = wordsUpTo(6)
  const w = pick(r, pool)
  const wrong = others(r, pool, w, 2, (a, b) => a.word[0] === b.word[0])
  return { prompt: 'Which word goes with the picture?', visual: { kind: 'emoji', name: w.emoji }, ...shuffleIn(r, { label: w.word }, wrong.map((x) => ({ label: x.word }))) }
}

function missingLetter(r: Random): Question {
  const w = pick(r, wordsUpTo(5))
  const i = 1 + Math.floor(r() * (w.word.length - 1))
  const gap = w.word.slice(0, i) + '_' + w.word.slice(i + 1)
  return {
    prompt: `Which letter is missing? ${gap}`,
    spoken: `Which letter is missing in ${w.word}?`,
    visual: { kind: 'emoji', name: w.emoji },
    // A missing vowel gets consonants as wrong answers and the other way round, and no wrong letter may make
    // another real word (b_t: "e", "i" and "u" would all make words; be_: "g" makes "beg").
    ...shuffleIn(r, { label: w.word[i] }, others(r, (VOWELS.includes(w.word[i]) ? CONSONANTS : VOWELS).filter((l) => !COMMON_WORDS.has(w.word.slice(0, i) + l + w.word.slice(i + 1))), w.word[i]).map((l) => ({ label: l }))),
  }
}

function spelling(r: Random, maxLetters: number): Question {
  const w = pick(r, wordsUpTo(maxLetters).filter((x) => x.word.length >= 3))
  // Asked about the picture, not "which word is spelt correctly": a changed letter can make another real
  // word (bear → bar), which is spelt correctly but is not the word for this picture.
  return {
    prompt: 'How do you spell the word for this picture?',
    spoken: `How do you spell ${w.word}?`,
    visual: { kind: 'emoji', name: w.emoji },
    ...shuffleIn(r, { label: w.word }, misspellings(w.word, r).map((m) => ({ label: m }))),
  }
}

function aOrAn(r: Random): Question {
  const w = pick(r, A_AN)
  const right = /^[aeiou]/.test(w.word) ? 'an' : 'a'
  return {
    prompt: `Which is right? ___ ${w.word}`,
    spoken: `A ${w.word}, or an ${w.word}?`,
    visual: w.emoji ? { kind: 'emoji', name: w.emoji } : undefined,
    ...shuffleIn(r, { label: right }, [{ label: right === 'a' ? 'an' : 'a' }]),
  }
}

/** Wrong forms built by the regular rule, so the choice teaches the exception. */
function wrongForms(base: string, right: string, endings: string[]): string[] {
  const forms = endings.map((e) => (e === '' ? base : base + e)).filter((f) => f !== right)
  return [...new Set(forms)].slice(0, 2)
}

function plural(r: Random): Question {
  const [one, many] = pick(r, PLURALS)
  const wrong = wrongForms(one, many, ['s', 'es', ''])
  return { prompt: `One ${one}, two …?`, ...shuffleIn(r, { label: many }, wrong.map((l) => ({ label: l }))) }
}

function pastTense(r: Random): Question {
  const [now, then] = pick(r, PAST_TENSES)
  const wrong = wrongForms(now, then, now.endsWith('e') ? ['s', ''] : ['ed', 's'])
  return { prompt: `Yesterday I ___ . (${now})`, spoken: `Yesterday I … what? Use the word ${now}.`, ...shuffleIn(r, { label: then }, wrong.map((l) => ({ label: l }))) }
}

function opposite(r: Random): Question {
  const pair = pick(r, OPPOSITES)
  const [word, right] = r() < 0.5 ? pair : [pair[1], pair[0]]
  const wrong = others(r, OPPOSITES.flat(), right).filter((w) => w !== word).slice(0, 2)
  return { prompt: `What is the opposite of "${word}"?`, ...shuffleIn(r, { label: right }, wrong.map((l) => ({ label: l }))) }
}

function alphabetical(r: Random): Question {
  const pool = wordsUpTo(10)
  const chosen: string[] = []
  for (const w of shuffled(pool, r)) {
    if (!chosen.some((c) => c[0] === w.word[0])) chosen.push(w.word)
    if (chosen.length === 3) break
  }
  const right = [...chosen].sort()[0]
  return { prompt: 'Which word comes first in the alphabet?', choices: chosen.map((l) => ({ label: l })), answer: chosen.indexOf(right) }
}

export const ENGLISH: Step[] = [
  { id: 'first-letter', stage: 0, skill: 'First sounds: which letter does it start with?', make: firstLetter },
  { id: 'match-word', stage: 1, skill: 'Reading short words', make: matchWord },
  { id: 'missing-letter', stage: 1, skill: 'Sounding out: the missing letter', make: missingLetter },
  { id: 'spell-short', stage: 2, skill: 'Spelling short words', make: (r) => spelling(r, 5) },
  { id: 'a-an', stage: 2, skill: 'Using "a" and "an"', make: aOrAn },
  { id: 'plurals', stage: 2, skill: 'Plurals: one and many', make: plural },
  { id: 'spell-long', stage: 3, skill: 'Spelling longer words', make: (r) => spelling(r, 10) },
  { id: 'past-tense', stage: 3, skill: 'The past tense', make: pastTense },
  { id: 'alphabet', stage: 3, skill: 'Alphabetical order', make: alphabetical },
  { id: 'opposites', stage: 4, skill: 'Opposites', make: opposite },
]
