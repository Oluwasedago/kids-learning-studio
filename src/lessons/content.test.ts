import { describe, expect, it } from 'vitest'
import { SUBJECTS } from '@/access/catalogue'
import { A_AN, ANIMALS, COMMON_WORDS, COUNTRIES, FRUITS, OPPOSITES, PAST_TENSES, PLURALS, WORDS } from './data'
import { UNCLEAR_EN } from './english'
import { FACTS } from './facts'
import type { Lang } from '@/i18n'
import { LADDERS } from './ladder'
import { type Choice, type Question, seeded, type Visual } from './question'
import { LESSON_EN, lessonText } from './text'
import { SPACE, WORLD_RECORDS } from './world-more'
import { ANIMAL_HOMES } from '@/library/animals'
import CREDITS from '@/library/photo-credits.json'
import { PLACE_COUNTRIES, PLACES } from '@/library/places'

// The content check: every lesson question must have exactly one right answer, and that answer must be true.
// Each step's questions are made thousands of times and checked against an answer key written here, apart
// from the code that makes them (so a mistake in a question maker cannot also hide in its check).

const ROUNDS = 1500
const label = (c: Choice) => c.label ?? ''
const right = (q: Question) => q.choices[q.answer]
const wrongs = (q: Question) => q.choices.filter((_, i) => i !== q.answer)
const emojiOf = (v: Visual | undefined) => (v?.kind === 'emoji' ? v.name : '')
const animalByEmoji = (name: string) => ANIMALS.find((a) => `animal-${a.id}` === name)
/** The id in a photo address ("photos/places/taj-mahal.jpg" → "taj-mahal"). */
const photoId = (v: Visual | undefined) => (v?.kind === 'photo' ? (v.src.match(/([\w-]+)\.jpg$/)?.[1] ?? '') : '')
const textOf = (q: Question) => (q.visual?.kind === 'text' ? q.visual.text : '')

/**
 * Animals a fact also fits, for a child: they must never be a wrong answer to that fact. Kept here, apart from
 * data.ts, as the answer key (each animal's fact read against every other animal in the list).
 */
const ALSO_FITS: Record<string, string[]> = {
  fox: ['owl'], // owls also hear mice under snow
  penguin: [], // "a bird that cannot fly": no other flightless bird in the list
  dolphin: ['spouting-whale'], // whales also click and whistle
  turtle: ['snail', 'crab'], // hard shells
  rabbit: ['kangaroo'], // hops and eats plants
  bear: ['panda'], // a panda is a bear
  kangaroo: ['koala'], // koalas have a pouch too
  horse: ['camel', 'elephant'], // people ride them too
  cow: ['camel', 'horse'], // camel milk; horses eat grass
  bat: ['owl'], // owls fly at night
  seal: ['snail'], // moves on its tummy
  mouse: ['chipmunk'], // small and squeaks
}


// ---- Answer keys for the Stage 4–6 English and world questions (written apart from english-more.ts) ----
const CONTRACTION_KEY: Record<string, string> = {
  'do not': "don't", 'is not': "isn't", 'I am': "I'm", 'you are': "you're", 'are not': "aren't", 'did not': "didn't",
  'was not': "wasn't", 'have not': "haven't", 'we have': "we've", 'has not': "hasn't", 'would not': "wouldn't",
  'they are': "they're", 'she is': "she's", 'does not': "doesn't", 'could not': "couldn't",
}
/** Real words a wrong short form must never be. */
const NOT_ALLOWED = new Set(['cant', 'ill', 'lets', 'well', 'wont', 'shell', 'were', 'its', 'hell', 'id', 'wed'])
const SUPERLATIVE_KEY: Record<string, string> = {
  tall: 'tallest', big: 'biggest', small: 'smallest', fast: 'fastest', happy: 'happiest', good: 'best', bad: 'worst',
  hot: 'hottest', funny: 'funniest', old: 'oldest', long: 'longest', sad: 'saddest', nice: 'nicest', busy: 'busiest', thin: 'thinnest',
}
/** Groups of words with (almost) the same meaning. */
const SAME_MEANING = [
  ['big', 'large', 'huge', 'enormous'], ['little', 'small', 'tiny'], ['glad', 'happy'], ['quick', 'fast'], ['begin', 'start'],
  ['finish', 'end'], ['shout', 'yell'], ['clever', 'smart'], ['afraid', 'scared'], ['sleepy', 'tired'], ['silent', 'quiet'],
  ['beautiful', 'pretty'], ['below', 'under'], ['gift', 'present'], ['rich', 'wealthy'],
]
const HOMOPHONE_KEY: Record<string, string> = {
  'I can ___ the birds singing.': 'hear', 'Come over ___ and sit down.': 'here', 'The children hung up ___ coats.': 'their',
  'Look over ___, by the tree!': 'there', '___ going to the park today.': "They're", 'I have ___ hands.': 'two',
  'We walked ___ school.': 'to', 'This soup is ___ hot to eat.': 'too', 'The ___ is shining in the sky.': 'sun',
  'Please ___ your name on the page.': 'write', 'Turn ___ at the corner.': 'right', 'Do you ___ the answer?': 'know',
  'We swam in the ___.': 'sea', 'I can ___ a rainbow!': 'see', 'There are seven days in a ___.': 'week',
  'Yesterday I ___ a big sandwich.': 'ate', 'A spider has ___ legs.': 'eight', 'The owl hoots at ___.': 'night',
  'The wind ___ the leaves away.': 'blew', 'The sky is ___ today.': 'blue',
}
const WORD_CLASS_KEY: Record<string, 'noun' | 'verb' | 'adjective'> = Object.fromEntries([
  ...'banana river teacher apple city window library mountain kitchen elephant'.split(' ').map((w) => [w, 'noun']),
  ...'write decide borrow eat explain forget choose bring sing arrive'.split(' ').map((w) => [w, 'verb']),
  ...'happy tall soft noisy heavy careful hungry beautiful tiny friendly'.split(' ').map((w) => [w, 'adjective']),
])
const NOT_KEY: Record<string, string> = {
  happy: 'unhappy', kind: 'unkind', tidy: 'untidy', possible: 'impossible', polite: 'impolite', correct: 'incorrect',
  visible: 'invisible', agree: 'disagree', honest: 'dishonest', legal: 'illegal', regular: 'irregular', safe: 'unsafe',
  patient: 'impatient', obey: 'disobey', complete: 'incomplete',
}
/** The right answer of every world record and space question (English), as the key for all three languages. */
const FIXED_KEY: Record<string, string> = {
  'Which is the biggest ocean?': 'The Pacific', 'Which is the biggest continent?': 'Asia', 'Which is the coldest continent?': 'Antarctica',
  'Which is the highest mountain in the world?': 'Mount Everest', 'Which is the biggest hot desert in the world?': 'The Sahara',
  'Which country is the biggest in the world?': 'Russia', 'Which is the longest river in Africa?': 'The Nile',
  'Which ocean lies between Europe and North America?': 'The Atlantic', 'Which country has the most people?': 'India',
  'Which is the biggest island in the world?': 'Greenland', 'Which country is shaped like a boot?': 'Italy',
  'Where is the biggest rainforest in the world?': 'The Amazon', 'Which planet is the biggest?': 'Jupiter',
  'Which planet is closest to the Sun?': 'Mercury', 'Which planet is called the Red Planet?': 'Mars',
  'Which planet is famous for its big, bright rings?': 'Saturn', 'What is the Sun?': 'A star',
  'How long does the Earth take to go once around the Sun?': 'One year', 'Why do we have day and night?': 'The Earth turns around',
  'Who was the first person to walk on the Moon?': 'Neil Armstrong', 'Which planet is farthest from the Sun?': 'Neptune',
  'Which star is closest to the Earth?': 'The Sun', 'What do we call a group of stars that makes a pattern in the sky?': 'A constellation',
  'Who was the first person to travel into space?': 'Yuri Gagarin',
}

/** Works out a sum written as "a + b", "a − b", "a × b", "a ÷ b", "double n", "half of n", "1/d of n". */
function solve(text: string): number {
  // Order of operations and squares: worked out by JavaScript's own rules (× before +, brackets first).
  if (/^[\d ()+−×²]+$/.test(text) && /[+−].*×|×.*[+−]|²|\(/.test(text)) {
    return Function(`return ${text.replace(/×/g, '*').replace(/−/g, '-').replace(/(\d+)²/g, '($1**2)')}`)() as number
  }
  let m = text.match(/^(\d+) ([+−×÷]) (\d+)$/)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[3])]
    return m[2] === '+' ? a + b : m[2] === '−' ? a - b : m[2] === '×' ? a * b : a / b
  }
  if ((m = text.match(/^double (\d+)$/))) return 2 * Number(m[1])
  if ((m = text.match(/^half of (\d+)$/))) return Number(m[1]) / 2
  if ((m = text.match(/^1\/(\d+) of (\d+)$/))) return Number(m[2]) / Number(m[1])
  if ((m = text.match(/^1\/(\d+) × (\d+)$/))) return Number(m[2]) / Number(m[1])
  // Tens and ones in any language: "3 tens + 4 ones", "3 Zehner + 4 Einer", "3 dizaines + 4 unités".
  if ((m = text.match(/^(\d) \D+ \+ (\d) \D+$/))) return 10 * Number(m[1]) + Number(m[2])
  if ((m = text.match(/^(\d+), \?$/))) return Number(m[1]) + 1
  if ((m = text.match(/^(\d+) h = \? min$/))) return 60 * Number(m[1])
  if ((m = text.match(/^(\d+) min = \? s$/))) return 60 * Number(m[1])
  if ((m = text.match(/^(\d+)% × (\d+)$/))) return (Number(m[1]) * Number(m[2])) / 100
  if ((m = text.match(/^\?, (\d+)$/))) return Number(m[1]) - 1
  throw new Error(`cannot solve "${text}"`)
}

/** The next number of a sequence "a, b, c, d, ?": a constant step, or doubling. */
function nextInSequence(text: string): number {
  const n = text.replace(', ?', '').split(', ').map(Number)
  const step = n[1] - n[0]
  if (n.every((x, i) => i === 0 || x - n[i - 1] === step)) return n[n.length - 1] + step
  if (n.every((x, i) => i === 0 || x === n[i - 1] * 2)) return n[n.length - 1] * 2
  const d = n.slice(1).map((x, i) => x - n[i])
  const dd = d[1] - d[0]
  if (d.every((x, i) => i === 0 || x - d[i - 1] === dd)) return n[n.length - 1] + d[d.length - 1] + dd
  throw new Error(`no rule in "${text}"`)
}

/** The next picture of a repeating pattern: the shortest period that fits everything shown. */
function nextInPattern(items: string[]): string {
  for (let p = 1; p < items.length; p++) if (items.every((x, i) => x === items[i % p])) return items[items.length % p]
  throw new Error(`no period in ${items.join(',')}`)
}

/** The answer key: checks one question of a step. Returns a problem, or null. */
function check(step: string, q: Question, lang: Lang): string | null {
  const T = lessonText(lang)
  const r = right(q)
  const w = wrongs(q)
  const isNumber = /^\d+$/.test(label(r))
  switch (step) {
    case 'count-5':
    case 'count-10':
      return q.visual?.kind === 'emoji' && Number(label(r)) === q.visual.count ? null : 'wrong count'
    case 'which-animal': {
      const a = ANIMALS.find((x) => x.id === photoId(q.visual))
      const name = a && T.animals[a.id].name
      return name && label(r) === name && !w.some((c) => label(c) === name) ? null : 'name does not match the picture'
    }
    case 'sea-animals': {
      const a = animalByEmoji(emojiOf(r.visual))
      return a?.sea && w.every((c) => !animalByEmoji(emojiOf(c.visual))?.sea) ? null : 'sea animal mix-up'
    }
    case 'animal-facts': {
      const a = animalByEmoji(emojiOf(r.visual))
      if (!a || q.prompt !== T.animals[a.id].fact) return 'fact does not match the animal'
      const bad = w.map((c) => animalByEmoji(emojiOf(c.visual))!).find((x) => ALSO_FITS[a.id]?.includes(x.id) || T.animals[x.id].fact === T.animals[a.id].fact)
      return bad ? `"${q.prompt}" is also true of the ${T.animals[bad.id].name}` : null
    }
    case 'easy-flags':
    case 'flags': {
      if (q.visual?.kind === 'flag') {
        const c = COUNTRIES.find((x) => x.id === (q.visual as { id: string }).id)
        return c && label(r) === T.countries[c.id].name ? null : 'flag and country do not match'
      }
      const c = COUNTRIES.find((x) => q.prompt === T.whichFlag(T.countries[x.id].name))
      return c && r.visual?.kind === 'flag' && r.visual.id === c.id ? null : 'flag and country do not match'
    }
    case 'continents': {
      const c = COUNTRIES.find((x) => q.prompt === T.whichContinent(T.countries[x.id].name))
      const name = c && T.continents[c.continent]
      return name && label(r) === name && !w.some((x) => label(x) === name) ? null : 'wrong continent'
    }
    case 'capitals': {
      const c = COUNTRIES.find((x) => q.prompt === T.capitalOf(T.countries[x.id].name))
      return c && label(r) === T.countries[c.id].capital ? null : 'wrong capital'
    }
    case 'places-where': {
      const place = PLACES.find((x) => x.id === photoId(q.visual))
      if (!place || place.countries.length !== 1) return 'a place in one country only'
      const name = PLACE_COUNTRIES[place.countries[0]][lang]
      return label(r) === name && !w.some((c) => label(c) === name) ? null : 'wrong country for the place'
    }
    case 'places-name': {
      const place = PLACES.find((x) => x.id === photoId(q.visual))
      const name = place?.text[lang].name
      return name && label(r) === name && !w.some((c) => label(c) === name) ? null : 'name does not match the photo'
    }
    case 'first-letter': {
      const w = WORDS.find((x) => x.emoji === emojiOf(q.visual))
      if (!w || UNCLEAR_EN.has(w.word)) return 'a picture with more than one name'
      if (q.prompt.includes(w.word)) return 'the prompt gives the word away'
      return label(r) === w.word[0] ? null : 'wrong first letter'
    }
    case 'match-word':
    case 'spell-short':
    case 'spell-long': {
      const word = WORDS.find((x) => x.emoji === emojiOf(q.visual))!.word
      return label(r) === word && !w.some((c) => label(c) === word) ? null : 'word does not match the picture'
    }
    case 'missing-letter': {
      const word = WORDS.find((x) => x.emoji === emojiOf(q.visual))!.word
      const gap = q.prompt.replace('Which letter is missing? ', '')
      const fill = (l: string) => gap.replace('_', l)
      if (fill(label(r)) !== word) return 'the letter does not complete the word'
      const alsoWord = w.find((c) => COMMON_WORDS.has(fill(label(c))) || WORDS.some((x) => x.word === fill(label(c))))
      return alsoWord ? `"${fill(label(alsoWord))}" is also a word` : null
    }
    case 'a-an': {
      const word = A_AN.find((x) => q.prompt.endsWith(` ${x.word}`))!.word
      return label(r) === (/^[aeiou]/.test(word) ? 'an' : 'a') ? null : 'a/an wrong'
    }
    case 'plurals': {
      const pair = PLURALS.find(([one]) => q.prompt === `One ${one}, two …?`)
      return pair && label(r) === pair[1] && !w.some((c) => label(c) === pair[1]) ? null : 'wrong plural'
    }
    case 'past-tense': {
      const pair = PAST_TENSES.find(([now]) => q.prompt.endsWith(`(${now})`))
      return pair && label(r) === pair[1] ? null : 'wrong past tense'
    }
    case 'opposites': {
      const word = q.prompt.match(/"(\w+)"/)![1]
      const isPair = (a: string, b: string) => OPPOSITES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
      if (!isPair(word, label(r))) return 'not the opposite'
      return w.some((c) => isPair(word, label(c)) || label(c) === word) ? 'a wrong answer is also right' : null
    }
    case 'alphabet': {
      const sorted = q.choices.map(label).sort()
      return label(r) === sorted[0] && sorted[0][0] !== sorted[1][0] ? null : 'alphabet order wrong'
    }
    case 'ab':
    case 'aab-abb':
    case 'abc-aabb':
      return q.visual?.kind === 'pattern' && emojiOf(r.visual) === nextInPattern(q.visual.items) ? null : 'pattern next is wrong'
    case 'place-value-1000': {
      const nums = (q.prompt.match(/\d+/g) ?? []).map(Number)
      const d = nums.find((x) => x < 10)!
      const n = nums.find((x) => x >= 100)!
      const digits = String(n)
      if (digits.split('').filter((c) => c === String(d)).length !== 1) return 'the digit is not there exactly once'
      const worth = d * 10 ** (2 - digits.indexOf(String(d)))
      return Number(label(r)) === worth && !w.some((c) => Number(label(c)) === worth) ? null : `${d} in ${n} is not worth ${label(r)}`
    }
    case 'round-10':
    case 'round-100': {
      const to = step === 'round-10' ? 10 : 100
      const n = Number(textOf(q).split(' ')[0])
      const expected = n % to >= to / 2 ? n - (n % to) + to : n - (n % to)
      return n % to !== 0 && Number(label(r)) === expected && !w.some((c) => Number(label(c)) === expected) ? null : `${n} rounds to ${expected}, not ${label(r)}`
    }
    case 'contractions': {
      const long = q.prompt.match(/"(.+)"/)![1]
      if (label(r) !== CONTRACTION_KEY[long]) return `short form of ${long} is not ${label(r)}`
      return w.some((c) => NOT_ALLOWED.has(label(c).toLowerCase()) || label(c) === label(r)) ? 'a wrong short form is a real word' : null
    }
    case 'comparatives': {
      const word = q.prompt.split(',')[0]
      return label(r) === SUPERLATIVE_KEY[word] && !w.some((c) => label(c) === SUPERLATIVE_KEY[word]) ? null : `wrong superlative of ${word}`
    }
    case 'synonyms': {
      const word = q.prompt.match(/"(\w+)"/)![1]
      const group = SAME_MEANING.find((g) => g.includes(word))!
      if (!group.includes(label(r)) || label(r) === word) return `${label(r)} does not mean ${word}`
      const also = w.find((c) => group.includes(label(c)))
      return also ? `"${label(also)}" also means ${word}` : null
    }
    case 'homophones':
      return label(r) === HOMOPHONE_KEY[q.prompt] && !w.some((c) => label(c) === label(r)) ? null : `wrong word for "${q.prompt}"`
    case 'word-classes': {
      const kind = q.prompt.match(/(noun|verb|adjective)/)![1]
      if (WORD_CLASS_KEY[label(r)] !== kind) return `${label(r)} is not a ${kind}`
      return w.some((c) => WORD_CLASS_KEY[label(c)] === kind || !WORD_CLASS_KEY[label(c)]) ? 'a wrong word is also a ' + kind : null
    }
    case 'prefixes': {
      const word = q.prompt.match(/"not (\w+)"/)![1]
      return label(r) === NOT_KEY[word] && !w.some((c) => label(c) === NOT_KEY[word] || c.label === word) ? null : `not ${word} is ${NOT_KEY[word]}`
    }
    case 'world-records':
    case 'space': {
      // The same question in all three languages: find it by its place in the bank, check the English key.
      const bank = step === 'space' ? SPACE : WORLD_RECORDS
      const item = bank.find((x) => x[lang][0] === q.prompt)
      if (!item) return 'unknown question'
      if (FIXED_KEY[item.en[0]] !== item.en[1]) return `key and bank differ: ${item.en[0]}`
      const [, right_, ...wrong_] = item[lang]
      if (new Set([right_, ...wrong_]).size !== 3) return 'two answers are the same'
      return label(r) === right_ && w.every((c) => wrong_.includes(label(c))) ? null : `wrong answer for ${q.prompt}`
    }
    case 'growing':
    case 'count-on':
    case 'count-5-10':
    case 'count-back':
    case 'steps-3-4':
    case 'any-step':
      return Number(label(r)) === nextInSequence(textOf(q)) ? null : 'sequence next is wrong'
    default:
      // Maths sums: the text shown is solved here and must match the right answer.
      if (!isNumber) return 'not a number'
      return Number(label(r)) === solve(textOf(q)) ? null : `${textOf(q)} is not ${label(r)}`
  }
}

const LANGS: Lang[] = ['en', 'de', 'fr']

describe('lesson content is right', () => {
  for (const lang of LANGS)
  for (const subject of SUBJECTS) {
    for (const [level, step] of LADDERS[subject].entries()) {
      it(`${lang} · ${subject} / ${step.id}: exactly one right answer, and it is true`, () => {
        const r = seeded(1000 + level)
        const problems = new Set<string>()
        for (let i = 0; i < ROUNDS; i++) {
          const q = step.make(r, lang)
          const keys = q.choices.map((c) => JSON.stringify(c))
          if (new Set(keys).size !== keys.length) problems.add(`same choice twice: ${keys.join(' | ')}`)
          if (q.answer < 0 || q.answer >= q.choices.length) problems.add('answer out of range')
          else {
            const p = check(step.id, q, lang)
            if (p) problems.add(`${p} — ${q.prompt} [${keys.join(' | ')}]`)
          }
        }
        expect([...problems].slice(0, 5)).toEqual([])
      })
    }
  }

  it('every picture a lesson or fact uses exists', () => {
    const names = new Set<string>([...FACTS.map((f) => f.emoji), ...WORDS.map((w) => w.emoji), ...FRUITS.map((f) => `fruit-${f.id}`)])
    for (const subject of SUBJECTS)
      for (const step of LADDERS[subject]) {
        const r = seeded(5)
        for (let i = 0; i < 300; i++) {
          const q = step.make(r, 'en')
          for (const v of [q.visual, ...q.choices.map((c) => c.visual)]) {
            if (v?.kind === 'emoji') names.add(v.name)
            if (v?.kind === 'pattern') v.items.forEach((x) => names.add(x))
          }
        }
      }
    const files = new Set(Object.keys(import.meta.glob('/public/emoji/*.png')).map((f) => f.replace('/public/emoji/', '').replace('.png', '')))
    const missing = [...names].filter((n) => !files.has(n))
    expect(missing).toEqual([])
  })

  it('every language has every animal, country, continent and skill, with no name twice', () => {
    const stepIds = SUBJECTS.flatMap((s) => LADDERS[s].map((x) => x.id))
    for (const lang of ['de', 'fr'] as const) {
      const T = lessonText(lang)
      expect(Object.keys(T.animals).sort(), lang).toEqual(Object.keys(LESSON_EN.animals).sort())
      expect(Object.keys(T.countries).sort(), lang).toEqual(Object.keys(LESSON_EN.countries).sort())
      expect(Object.keys(T.skills).sort(), lang).toEqual([...stepIds].sort())
    }
    for (const lang of LANGS) {
      const T = lessonText(lang)
      const names = Object.values(T.animals).map((a) => a.name.toLowerCase())
      expect(new Set(names).size, lang).toBe(names.length)
      const countries = Object.values(T.countries).map((c) => c.name)
      expect(new Set(countries).size, lang).toBe(countries.length)
    }
  })

  it('every "Did you know?" fact is translated (not left in English)', () => {
    for (const f of FACTS) for (const lang of ['de', 'fr'] as const) expect(f[lang].length > 10 && f[lang] !== f.text, f.text).toBe(true)
  })

  it('no animal fact gives the answer away by naming the animal', () => {
    for (const lang of LANGS) {
      const T = lessonText(lang)
      const giveaways = Object.values(T.animals).filter((a) => a.fact.toLowerCase().includes(a.name.toLowerCase()))
      expect(giveaways.map((a) => `${lang}: ${a.fact}`)).toEqual([])
    }
  })

  it('every photo exists, has a free licence and a credit; every place and animal has its texts', () => {
    const files = new Set(Object.keys(import.meta.glob('/public/photos/**/*.jpg')).map((f) => f.replace('/public/', '')))
    const credits = CREDITS as Record<string, { author: string; licence: string; source: string }>
    for (const id of [...PLACES.map((x) => x.id), ...ANIMALS.map((a) => a.id)]) {
      expect(credits[id]?.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
      expect(credits[id].licence, id).toMatch(/^(public domain|cc0|cc by(-sa)? \d)/i)
    }
    for (const x of PLACES) expect(files.has(`photos/places/${x.id}.jpg`), x.id).toBe(true)
    for (const a of ANIMALS) expect(files.has(`photos/animals/${a.id}.jpg`), a.id).toBe(true)
    for (const lang of LANGS) {
      for (const x of PLACES) {
        expect(x.text[lang].name.length > 1 && x.text[lang].about.length > 20, `${lang} ${x.id}`).toBe(true)
        for (const c of x.countries) expect(PLACE_COUNTRIES[c][lang], c).toBeTruthy()
      }
      for (const a of ANIMALS) expect(ANIMAL_HOMES[a.id][lang].length > 3, `${lang} ${a.id}`).toBe(true)
      const names = PLACES.map((x) => x.text[lang].name)
      expect(new Set(names).size, lang).toBe(names.length)
    }
  })

  it('every animal in a "never together" list exists', () => {
    const ids = new Set(ANIMALS.map((a) => a.id))
    expect(ANIMALS.flatMap((a) => (a.notWith ?? []).filter((id) => !ids.has(id)))).toEqual([])
  })
})
