// A question: a prompt (shown and read aloud), an optional picture, and big answer buttons.
// A wrong tap is simply tried again; "right at the first try" counts for the score and the adaptive level.

export type Visual =
  | { kind: 'emoji'; name: string; count?: number }
  | { kind: 'flag'; id: string }
  | { kind: 'pattern'; items: string[] }
  | { kind: 'text'; text: string }

export interface Choice {
  label?: string
  visual?: Visual
}

export interface Question {
  prompt: string
  /** Read out instead of the prompt where the prompt has a gap (e.g. "f_x"). */
  spoken?: string
  visual?: Visual
  choices: Choice[]
  answer: number
}

/** Returns 0 ≤ n < 1, like Math.random (replaceable in tests). */
export type Random = () => number

export const pick = <T,>(r: Random, list: readonly T[]): T => list[Math.floor(r() * list.length)]
export const int = (r: Random, min: number, max: number) => min + Math.floor(r() * (max - min + 1))

/** A shuffled copy (Fisher–Yates). */
export function shuffled<T>(items: readonly T[], r: Random = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** `count` different items from a list, none equal to `except`. */
export function others<T>(r: Random, list: readonly T[], except: T, count = 2, same = (a: T, b: T) => a === b): T[] {
  return shuffled(list, r)
    .filter((x) => !same(x, except))
    .filter((x, i, all) => all.findIndex((y) => same(x, y)) === i)
    .slice(0, count)
}

/** Puts the right choice among the others at a random place. */
export function shuffleIn(r: Random, right: Choice, wrong: Choice[]): { choices: Choice[]; answer: number } {
  const answer = int(r, 0, wrong.length)
  const choices = [...wrong]
  choices.splice(answer, 0, right)
  return { choices, answer }
}

/** A question whose answer is a number, with wrong numbers close to it (never negative, all different). */
export function numberQuestion(r: Random, prompt: string, right: number, visual?: Visual, spread = [1, -1, 2, -2, 10, -10]): Question {
  const wrong: number[] = []
  for (let guard = 0; wrong.length < 2 && guard < 100; guard++) {
    const n = right + pick(r, spread)
    if (n >= 0 && n !== right && !wrong.includes(n)) wrong.push(n)
  }
  for (let n = right + 3; wrong.length < 2; n++) if (!wrong.includes(n)) wrong.push(n)
  return { prompt, visual, ...shuffleIn(r, { label: String(right) }, wrong.map((n) => ({ label: String(n) }))) }
}

/** Seeded random numbers (mulberry32), for tests. */
export function seeded(seed: number): Random {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
