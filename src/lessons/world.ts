import { ANIMALS, CONTINENTS, COUNTRIES, type Country } from './data'
import { others, pick, type Question, type Random, shuffleIn } from './question'
import type { Step } from './step'

// World ladder: animals → where they live → flags → continents → capital cities.

/** Flags that are easy to tell apart (different shapes or very different colours), for the first flag step. */
const EASY_FLAGS = ['de', 'fr', 'it', 'jp', 'se', 'ch', 'ng', 'ua', 'pl', 'dk']

const sameCountry = (a: Country, b: Country) => a.id === b.id

function whichAnimal(r: Random): Question {
  const a = pick(r, ANIMALS)
  return {
    prompt: 'Which animal is this?',
    visual: { kind: 'emoji', name: `animal-${a.id}` },
    ...shuffleIn(r, { label: a.name }, others(r, ANIMALS, a, 2, (x, y) => x.id === y.id).map((x) => ({ label: x.name }))),
  }
}

function livesInSea(r: Random): Question {
  const sea = pick(r, ANIMALS.filter((a) => a.sea))
  const land = others(r, ANIMALS.filter((a) => !a.sea && a.id !== 'otter' && a.id !== 'penguin' && a.id !== 'turtle'), sea)
  return {
    prompt: 'Which animal lives in the sea?',
    ...shuffleIn(r, { visual: { kind: 'emoji', name: `animal-${sea.id}` } }, land.map((a) => ({ visual: { kind: 'emoji', name: `animal-${a.id}` } }))),
  }
}

function flagToCountry(r: Random, pool: Country[]): Question {
  const c = pick(r, pool)
  return {
    prompt: 'Which country has this flag?',
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: c.name }, others(r, pool, c, 2, sameCountry).map((x) => ({ label: x.name }))),
  }
}

function countryToFlag(r: Random): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: `Which flag belongs to ${c.name}?`,
    ...shuffleIn(r, { visual: { kind: 'flag', id: c.id } }, others(r, COUNTRIES, c, 2, sameCountry).map((x) => ({ visual: { kind: 'flag', id: x.id } }))),
  }
}

function animalFact(r: Random): Question {
  const a = pick(r, ANIMALS)
  return {
    prompt: a.fact,
    spoken: `${a.fact} Which animal is it?`,
    ...shuffleIn(r, { visual: { kind: 'emoji', name: `animal-${a.id}` } }, others(r, ANIMALS, a, 2, (x, y) => x.id === y.id).map((x) => ({ visual: { kind: 'emoji', name: `animal-${x.id}` } }))),
  }
}

function continent(r: Random): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: `Which continent is ${c.name} in?`,
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: c.continent }, others(r, CONTINENTS, c.continent).map((x) => ({ label: x }))),
  }
}

function capital(r: Random): Question {
  const c = pick(r, COUNTRIES)
  return {
    prompt: `What is the capital city of ${c.name}?`,
    visual: { kind: 'flag', id: c.id },
    ...shuffleIn(r, { label: c.capital }, others(r, COUNTRIES, c, 2, sameCountry).map((x) => ({ label: x.capital }))),
  }
}

export const WORLD: Step[] = [
  { id: 'which-animal', stage: 0, skill: 'Naming animals', make: whichAnimal },
  { id: 'sea-animals', stage: 1, skill: 'Where animals live: the sea', make: livesInSea },
  { id: 'easy-flags', stage: 1, skill: 'First flags', make: (r) => flagToCountry(r, COUNTRIES.filter((c) => EASY_FLAGS.includes(c.id))) },
  { id: 'flags', stage: 2, skill: 'Flags of the world', make: (r) => (r() < 0.5 ? flagToCountry(r, COUNTRIES) : countryToFlag(r)) },
  { id: 'animal-facts', stage: 2, skill: 'Animal facts', make: animalFact },
  { id: 'continents', stage: 3, skill: 'Countries and continents', make: continent },
  { id: 'capitals', stage: 4, skill: 'Capital cities', make: capital },
]
