import type { Lang } from '@/i18n'
import { ANIMALS, type Continent, COUNTRIES } from './data'
import { LESSON_DE } from './text-de'
import { LESSON_FR } from './text-fr'

// The words of the maths, world and patterns lessons in each app language: question wording, animal names
// and facts, countries and capitals, continents, and the skill names parents see. The English subject is not
// here: it teaches English, so it stays in English in every language.
// English comes from data.ts; German and French from text-de.ts and text-fr.ts. content.test.ts checks every
// question in every language against its answer key, and that nothing is missing.

export interface LessonText {
  howMany: string
  sum: (a: number, op: string, b: number) => string
  oneMore: (n: number) => string
  oneLess: (n: number) => string
  after: (n: number) => string
  before: (n: number) => string
  tensOnes: (tens: number, ones: number) => string
  /** The tens and ones shown big ("3 tens + 4 ones"). */
  tensOnesShown: (tens: number, ones: number) => string
  double: (n: number) => string
  half: (n: number) => string
  /** "one third of 12": the fraction by its denominator (2, 3, 4 or 5). */
  fraction: (denominator: 2 | 3 | 4 | 5, n: number) => string
  nextPicture: string
  nextNumber: string
  whichAnimal: string
  livesInSea: string
  /** Read out after an animal fact. */
  whichAnimalIsIt: string
  whichCountry: string
  whichFlag: (country: string) => string
  whichContinent: (country: string) => string
  capitalOf: (country: string) => string
  whereIsPlace: string
  whatIsPlace: string
  /** Animal names and facts by animal id. A fact never names the animal. */
  animals: Record<string, { name: string; fact: string }>
  countries: Record<string, { name: string; capital: string }>
  continents: Record<Continent, string>
  /** Skill names by ladder step id (for parents, and "Next up: …"). */
  skills: Record<string, string>
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const FRACTIONS_EN = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth' } as const

export const LESSON_EN: LessonText = {
  howMany: 'How many are there? Count carefully!',
  sum: (a, op, b) => `What is ${a} ${op} ${b}?`,
  oneMore: (n) => `What is one more than ${n}?`,
  oneLess: (n) => `What is one less than ${n}?`,
  after: (n) => `Which number comes after ${n}?`,
  before: (n) => `Which number comes before ${n}?`,
  tensOnes: (t, o) => `${plural(t, 'ten', 'tens')} and ${plural(o, 'one', 'ones')} make which number?`,
  tensOnesShown: (t, o) => `${plural(t, 'ten', 'tens')} + ${plural(o, 'one', 'ones')}`,
  double: (n) => `What is double ${n}?`,
  half: (n) => `What is half of ${n}?`,
  fraction: (d, n) => `What is one ${FRACTIONS_EN[d]} of ${n}?`,
  nextPicture: 'What comes next?',
  nextNumber: 'Which number comes next?',
  whichAnimal: 'Which animal is this?',
  livesInSea: 'Which animal lives in the sea?',
  whichAnimalIsIt: 'Which animal is it?',
  whichCountry: 'Which country has this flag?',
  whichFlag: (c) => `Which flag belongs to ${c}?`,
  whichContinent: (c) => `Which continent is ${c} in?`,
  capitalOf: (c) => `What is the capital city of ${c}?`,
  whereIsPlace: 'Which country is this place in?',
  whatIsPlace: 'What is this place called?',
  animals: Object.fromEntries(ANIMALS.map((a) => [a.id, { name: a.name, fact: a.fact }])),
  countries: Object.fromEntries(COUNTRIES.map((c) => [c.id, { name: c.name, capital: c.capital }])),
  continents: { Europe: 'Europe', Africa: 'Africa', Asia: 'Asia', 'South America': 'South America' },
  // English skill names live on the ladder steps themselves (step.skill).
  skills: {},
}

const LESSONS: Record<Lang, LessonText> = { en: LESSON_EN, de: LESSON_DE, fr: LESSON_FR }

/** The lesson words for a language. */
export const lessonText = (lang: Lang): LessonText => LESSONS[lang]

/** A ladder step's skill name in a language (English: the step's own name). */
export const skillName = (step: { id: string; skill: string }, lang: Lang) => LESSONS[lang].skills[step.id] ?? step.skill

/** An animal's name in a language. */
export const animalName = (id: string, lang: Lang) => LESSONS[lang].animals[id]?.name ?? id
