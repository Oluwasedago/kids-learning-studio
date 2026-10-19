import { int, numberQuestion, pick, type Question, type Random, shuffleIn } from './question'
import type { Step } from './step'

// Patterns ladder: picture patterns (AB → ABC → AABB) → number sequences (counting on in 1s, 2s, 5s, 10s → any step → doubling).

const PICTURES = ['star', 'heart', 'sun', 'snowflake', 'fruit-apple', 'fruit-banana', 'fruit-grapes', 'animal-frog', 'animal-fox', 'moon']

function picturePattern(r: Random, rules: string[]): Question {
  const rule = pick(r, rules)
  const symbols: string[] = []
  while (symbols.length < 3) {
    const s = pick(r, PICTURES)
    if (!symbols.includes(s)) symbols.push(s)
  }
  const at = (i: number) => symbols['ABC'.indexOf(rule[i % rule.length])]
  const shown = Math.max(5, rule.length * 2)
  const items = Array.from({ length: shown }, (_, i) => at(i))
  const right = at(shown)
  const wrong = symbols.filter((s) => s !== right).slice(0, 2)
  return {
    prompt: 'What comes next?',
    visual: { kind: 'pattern', items },
    ...shuffleIn(r, { visual: { kind: 'emoji', name: right } }, wrong.map((s) => ({ visual: { kind: 'emoji', name: s } }))),
  }
}

/** A number sequence with a fixed step; the child finds the next number. */
function sequence(r: Random, steps: number[], start: [number, number], length = 4): Question {
  const step = pick(r, steps)
  const first = step < 0 ? int(r, start[0], start[1]) + -step * length : int(r, start[0], start[1])
  const items = Array.from({ length }, (_, i) => first + i * step)
  return numberQuestion(r, 'Which number comes next?', first + length * step, { kind: 'text', text: `${items.join(', ')}, ?` }, [Math.abs(step), -Math.abs(step), 1, -1])
}

function doubling(r: Random): Question {
  const first = int(r, 1, 5)
  const items = [first, first * 2, first * 4, first * 8]
  return numberQuestion(r, 'Which number comes next?', first * 16, { kind: 'text', text: `${items.join(', ')}, ?` }, [first, -first, first * 8, 2])
}

export const PATTERNS: Step[] = [
  { id: 'ab', stage: 0, skill: 'Picture patterns: AB', make: (r) => picturePattern(r, ['AB']) },
  { id: 'aab-abb', stage: 1, skill: 'Picture patterns: AAB and ABB', make: (r) => picturePattern(r, ['AAB', 'ABB']) },
  { id: 'abc-aabb', stage: 1, skill: 'Picture patterns: ABC and AABB', make: (r) => picturePattern(r, ['ABC', 'AABB']) },
  { id: 'count-on', stage: 2, skill: 'Counting on in 1s and 2s', make: (r) => sequence(r, [1, 2], [0, 20]) },
  { id: 'count-5-10', stage: 2, skill: 'Counting in 5s and 10s', make: (r) => sequence(r, [5, 10], [0, 4]) },
  { id: 'count-back', stage: 3, skill: 'Counting back in 1s, 2s and 10s', make: (r) => sequence(r, [-1, -2, -10], [1, 20]) },
  { id: 'steps-3-4', stage: 4, skill: 'Sequences in 3s, 4s and 25s', make: (r) => sequence(r, [3, 4, 25], [0, 10]) },
  { id: 'any-step', stage: 5, skill: 'Finding the rule: any step, or doubling', make: (r) => (r() < 0.3 ? doubling(r) : sequence(r, [6, 7, 8, 9, -3, -4, -5], [1, 30])) },
]
