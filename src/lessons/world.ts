import { ANIMALS, CONTINENTS, COUNTRIES, type Country } from './data'
import { others, pick, type Question, type Random, shuffleIn } from './question'
import type { Step } from './step'
import { type LessonText, lessonText } from './text'

// World ladder: animals → where they live → flags → continents → capital cities.

/** Flags that are easy to tell apart (different shapes or very different colours), for the first flag step. */
const EASY_FLAGS = ['de', 'fr', 'it', 'jp', 'se', 'ch', 'ng', 'ua', 'pl', 'dk']

const sameCountry = (a: Country, b: Country) => a.id === b.id

function whichAnimal(r: Random, T: LessonText): Question {
  const a = pick(r, ANIMALS)
  const name = (id: string) => T.animals[id].name
  return {
    prompt: T.whichAnimal,
    visual: { kind: 'emoji', name: `animal-${a.id}` },
    ...shuffleIn(r, { label: name(a.id) }, others(r, ANIMALS, a, 2, (x, y) => x.id === y.id).map((x) => ({ label: name(x.id) }))),
  }
}

function livesInSea(r: Random, T: LessonText): Question {
  const sea = pick(r, ANIMALS.filter((a) => a.sea))
  const land = others(r, ANIMALS.filter((a) => !a.sea && a.id !== 'otter' && a.id !== 'penguin' && a.id !== 'turtle'), sea)
  return {
    prompt: T.livesInSea,
    ...shuffleIn(r, { visual: { kind: 'emoji', name: `animal-${sea.id}` } }, land.map((a) => ({ visual: { kind: 'emoji', name: `animal-${a.id}` } }))),
  }
}

function flagToCountry(r: Random, T: LessonText, pool: Country[]): Question {
  const c = pick(r, pool)
  return {
    prompt: T.whichCountry,
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: T.countries[c.id].name }, others(r, pool, c, 2, sameCountry).map((x) => ({ label: T.countries[x.id].name }))),
  }
}

function countryToFlag(r: Random, T: LessonText): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: T.whichFlag(T.countries[c.id].name),
    ...shuffleIn(r, { visual: { kind: 'flag', id: c.id } }, others(r, COUNTRIES, c, 2, sameCountry).map((x) => ({ visual: { kind: 'flag', id: x.id } }))),
  }
}

function animalFact(r: Random, T: LessonText): Question {
  const a = pick(r, ANIMALS)
  const fact = T.animals[a.id].fact
  return {
    prompt: fact,
    spoken: `${fact} ${T.whichAnimalIsIt}`,
    ...shuffleIn(r, { visual: { kind: 'emoji', name: `animal-${a.id}` } }, others(r, ANIMALS.filter((x) => !a.notWith?.includes(x.id)), a, 2, (x, y) => x.id === y.id).map((x) => ({ visual: { kind: 'emoji', name: `animal-${x.id}` } }))),
  }
}

function continent(r: Random, T: LessonText): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: T.whichContinent(T.countries[c.id].name),
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: T.continents[c.continent] }, others(r, CONTINENTS, c.continent).map((x) => ({ label: T.continents[x] }))),
  }
}

function capital(r: Random, T: LessonText): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: T.capitalOf(T.countries[c.id].name),
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: T.countries[c.id].capital }, others(r, COUNTRIES, c, 2, sameCountry).map((x) => ({ label: T.countries[x.id].capital }))),
  }
}

export const WORLD: Step[] = [
  { id: 'which-animal', stage: 0, skill: 'Naming animals', make: (r, l) => whichAnimal(r, lessonText(l)) },
  { id: 'sea-animals', stage: 1, skill: 'Where animals live: the sea', make: (r, l) => livesInSea(r, lessonText(l)) },
  { id: 'easy-flags', stage: 1, skill: 'First flags', make: (r, l) => flagToCountry(r, lessonText(l), COUNTRIES.filter((c) => EASY_FLAGS.includes(c.id))) },
  { id: 'flags', stage: 2, skill: 'Flags of the world', make: (r, l) => (r() < 0.5 ? flagToCountry(r, lessonText(l), COUNTRIES) : countryToFlag(r, lessonText(l))) },
  { id: 'animal-facts', stage: 2, skill: 'Animal facts', make: (r, l) => animalFact(r, lessonText(l)) },
  { id: 'continents', stage: 3, skill: 'Countries and continents', make: (r, l) => continent(r, lessonText(l)) },
  { id: 'capitals', stage: 4, skill: 'Capital cities', make: (r, l) => capital(r, lessonText(l)) },
]
