import { others, pick, type Question, type Random, shuffleIn } from './question'

// English for Stages 4–6: contractions, comparatives, synonyms, homophones, word classes and prefixes.
// Every list is chosen so that each question has exactly one right answer: no word that belongs to two word
// classes, no prefix that makes another real word, no synonym pair that overlaps another. Checked by
// content.test.ts (with its own answer key).

/** Long form → short form. Left out: can't, I'll, let's, we'll ("cant", "ill", "lets", "well" are words). */
export const CONTRACTIONS: [string, string][] = [
  ['do not', "don't"], ['is not', "isn't"], ['I am', "I'm"], ['you are', "you're"], ['are not', "aren't"],
  ['did not', "didn't"], ['was not', "wasn't"], ['have not', "haven't"], ['we have', "we've"], ['has not', "hasn't"],
  ['would not', "wouldn't"], ['they are', "they're"], ['she is', "she's"], ['does not', "doesn't"], ['could not', "couldn't"],
]

/** Word, comparative, superlative. */
export const COMPARISONS: [string, string, string][] = [
  ['tall', 'taller', 'tallest'], ['big', 'bigger', 'biggest'], ['small', 'smaller', 'smallest'], ['fast', 'faster', 'fastest'],
  ['happy', 'happier', 'happiest'], ['good', 'better', 'best'], ['bad', 'worse', 'worst'], ['hot', 'hotter', 'hottest'],
  ['funny', 'funnier', 'funniest'], ['old', 'older', 'oldest'], ['long', 'longer', 'longest'], ['sad', 'sadder', 'saddest'],
  ['nice', 'nicer', 'nicest'], ['busy', 'busier', 'busiest'], ['thin', 'thinner', 'thinnest'],
]

/** Pairs of words that mean almost the same (no word close in meaning to a word of another pair). */
export const SYNONYMS: [string, string][] = [
  ['big', 'large'], ['little', 'small'], ['glad', 'happy'], ['quick', 'fast'], ['begin', 'start'], ['finish', 'end'],
  ['shout', 'yell'], ['clever', 'smart'], ['afraid', 'scared'], ['sleepy', 'tired'], ['silent', 'quiet'],
  ['beautiful', 'pretty'], ['below', 'under'], ['gift', 'present'], ['rich', 'wealthy'],
]

/** Sentences with a gap and the word that fits; the other words of the set sound the same. */
export const HOMOPHONES: { sentence: string; right: string; set: string[] }[] = [
  { sentence: 'I can ___ the birds singing.', right: 'hear', set: ['hear', 'here'] },
  { sentence: 'Come over ___ and sit down.', right: 'here', set: ['here', 'hear'] },
  { sentence: 'The children hung up ___ coats.', right: 'their', set: ['their', 'there', "they're"] },
  { sentence: 'Look over ___, by the tree!', right: 'there', set: ['there', 'their', "they're"] },
  { sentence: '___ going to the park today.', right: "They're", set: ["They're", 'Their', 'There'] },
  { sentence: 'I have ___ hands.', right: 'two', set: ['two', 'to', 'too'] },
  { sentence: 'We walked ___ school.', right: 'to', set: ['to', 'two', 'too'] },
  { sentence: 'This soup is ___ hot to eat.', right: 'too', set: ['too', 'to', 'two'] },
  { sentence: 'The ___ is shining in the sky.', right: 'sun', set: ['sun', 'son'] },
  { sentence: 'Please ___ your name on the page.', right: 'write', set: ['write', 'right'] },
  { sentence: 'Turn ___ at the corner.', right: 'right', set: ['right', 'write'] },
  { sentence: 'Do you ___ the answer?', right: 'know', set: ['know', 'no'] },
  { sentence: 'We swam in the ___.', right: 'sea', set: ['sea', 'see'] },
  { sentence: 'I can ___ a rainbow!', right: 'see', set: ['see', 'sea'] },
  { sentence: 'There are seven days in a ___.', right: 'week', set: ['week', 'weak'] },
  { sentence: 'Yesterday I ___ a big sandwich.', right: 'ate', set: ['ate', 'eight'] },
  { sentence: 'A spider has ___ legs.', right: 'eight', set: ['eight', 'ate'] },
  { sentence: 'The owl hoots at ___.', right: 'night', set: ['night', 'knight'] },
  { sentence: 'The wind ___ the leaves away.', right: 'blew', set: ['blew', 'blue'] },
  { sentence: 'The sky is ___ today.', right: 'blue', set: ['blue', 'blew'] },
]

/** Words that belong to one word class only (no "run" or "pencil", which can be a noun and a verb). */
export const WORD_CLASSES: Record<'noun' | 'verb' | 'adjective', string[]> = {
  noun: ['banana', 'river', 'teacher', 'apple', 'city', 'window', 'library', 'mountain', 'kitchen', 'elephant'],
  verb: ['write', 'decide', 'borrow', 'eat', 'explain', 'forget', 'choose', 'bring', 'sing', 'arrive'],
  adjective: ['happy', 'tall', 'soft', 'noisy', 'heavy', 'careful', 'hungry', 'beautiful', 'tiny', 'friendly'],
}

/** Word → the word meaning "not …" (prefixes un-, dis-, im-, in-, il-, ir-). */
export const PREFIXED: [string, string][] = [
  ['happy', 'unhappy'], ['kind', 'unkind'], ['tidy', 'untidy'], ['possible', 'impossible'], ['polite', 'impolite'],
  ['correct', 'incorrect'], ['visible', 'invisible'], ['agree', 'disagree'], ['honest', 'dishonest'], ['legal', 'illegal'],
  ['regular', 'irregular'], ['safe', 'unsafe'], ['patient', 'impatient'], ['obey', 'disobey'], ['complete', 'incomplete'],
]

const PREFIXES = ['un', 'dis', 'im', 'in', 'il', 'ir']

function contraction(r: Random): Question {
  const [long, short] = pick(r, CONTRACTIONS)
  const i = short.indexOf("'")
  const noApostrophe = short.replace("'", '')
  // The apostrophe one letter too early (didn't → did'nt), or missing.
  const early = short.slice(0, i - 1) + "'" + short[i - 1] + short.slice(i + 1)
  return { prompt: `What is the short form of "${long}"?`, ...shuffleIn(r, { label: short }, [{ label: early }, { label: noApostrophe }]) }
}

function comparison(r: Random): Question {
  const [word, more, most] = pick(r, COMPARISONS)
  const wrong = [word + 'est' !== most ? word + 'est' : `most ${word}`, more + 'est']
  return { prompt: `${word}, ${more}, …?`, spoken: `${word}, ${more}, and then?`, ...shuffleIn(r, { label: most }, wrong.map((l) => ({ label: l }))) }
}

function synonym(r: Random): Question {
  const pair = pick(r, SYNONYMS)
  const [word, right] = r() < 0.5 ? pair : [pair[1], pair[0]]
  const wrong = others(r, SYNONYMS.filter((p) => p !== pair).flat(), right)
  return { prompt: `Which word means almost the same as "${word}"?`, ...shuffleIn(r, { label: right }, wrong.map((l) => ({ label: l }))) }
}

function homophone(r: Random): Question {
  const h = pick(r, HOMOPHONES)
  return { prompt: h.sentence, spoken: `Which word fits? ${h.sentence.replace('___', 'blank')}`, ...shuffleIn(r, { label: h.right }, h.set.filter((w) => w !== h.right).map((l) => ({ label: l }))) }
}

function wordClass(r: Random): Question {
  const kind = pick(r, ['noun', 'verb', 'adjective'] as const)
  const right = pick(r, WORD_CLASSES[kind])
  const otherKinds = (['noun', 'verb', 'adjective'] as const).filter((k) => k !== kind)
  return { prompt: `Which word is ${kind === 'adjective' ? 'an' : 'a'} ${kind}?`, ...shuffleIn(r, { label: right }, otherKinds.map((k) => ({ label: pick(r, WORD_CLASSES[k]) }))) }
}

function prefix(r: Random): Question {
  const [word, right] = pick(r, PREFIXED)
  const used = right.slice(0, right.length - word.length)
  const wrong = others(r, PREFIXES.filter((p) => p !== used && !(['im', 'in', 'il', 'ir'].includes(p) && ['im', 'in', 'il', 'ir'].includes(used))), used).map((p) => p + word)
  return { prompt: `Which word means "not ${word}"?`, ...shuffleIn(r, { label: right }, wrong.map((l) => ({ label: l }))) }
}

export const ENGLISH_MORE = { contraction, comparison, synonym, homophone, wordClass, prefix }
