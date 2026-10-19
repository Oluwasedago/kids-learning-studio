import type { Subject } from '@/access/catalogue'
import { ENGLISH } from './english'
import { MATHS } from './maths'
import { PATTERNS } from './patterns'
import type { Question, Random } from './question'
import type { Step } from './step'
import { WORLD } from './world'

// The skills ladder: per subject, steps from easiest to hardest, each tagged with a Cambridge Primary stage.
//
// How stages line up with ages and other school systems (by the usual age of the children; approximate):
//
//   Stage   Age     Cambridge Primary   England    US             Berlin
//   0       4–5     (early years)       Reception  Pre-K          Kita / Vorschule
//   1       5–6     Stage 1             Year 1     Kindergarten   Kita / Vorschule
//   2       6–7     Stage 2             Year 2     Grade 1        Klasse 1
//   3       7–8     Stage 3             Year 3     Grade 2        Klasse 2
//   4       8–9     Stage 4             Year 4     Grade 3        Klasse 3
//   5       9–10    Stage 5             Year 5     Grade 4        Klasse 4
//   6       10–11   Stage 6             Year 6     Grade 5        Klasse 5
//
// Status: Cambridge Primary covers ages 5–11 in Stages 1–6 (as Cambridge describes it); the one-year-per-stage
// ages above, the US/Berlin columns and the skill-to-stage placement are ASSUMED from the usual order of these
// topics, to verify against each curriculum framework before v1 (ROADMAP.md). Content differs between systems,
// so the app shows these as "about", never "equals".

export const LADDERS: Record<Subject, Step[]> = { maths: MATHS, english: ENGLISH, world: WORLD, patterns: PATTERNS }

export interface StageTags {
  cambridge: string
  us: string
  berlin: string
}

/** School-system labels for a stage (approximate, see the table above). Pure (tested). */
export function stageTags(stage: number): StageTags {
  const s = Math.max(0, Math.min(6, stage))
  return {
    cambridge: s === 0 ? 'Early years' : `Stage ${s}`,
    us: s === 0 ? 'Pre-K' : s === 1 ? 'Kindergarten' : `Grade ${s - 1}`,
    berlin: s <= 1 ? 'Kita / Vorschule' : `Klasse ${s - 1}`,
  }
}

/** The stage that matches an age (age 5 → Stage 1). */
export const stageForAge = (age: number) => Math.max(0, Math.min(6, age - 4))

/**
 * Where a child starts: the first step one stage below their age, so the first missions feel easy;
 * the adaptive level moves them up after two strong rounds. Pure (tested).
 */
export function startLevel(subject: Subject, age: number): number {
  const steps = LADDERS[subject]
  const target = Math.max(0, stageForAge(age) - 1)
  const i = steps.findIndex((s) => s.stage >= target)
  return i === -1 ? steps.length - 1 : i
}

/** A round counts as strong at 7 of 8 right at the first try, weak at half or less. */
export const STRONG = 0.85
export const WEAK = 0.5

/**
 * The adaptive step: after two strong rounds in a row, one step up; after a weak round, one step down.
 * `recent` holds the last results on the current step (0-1); it starts afresh after a change. Pure (tested).
 */
export function adapt(level: number, recent: number[], result: number, maxLevel: number): { level: number; recent: number[] } {
  const history = [...recent, result].slice(-2)
  if (result <= WEAK && level > 0) return { level: level - 1, recent: [] }
  if (history.length === 2 && history.every((x) => x >= STRONG) && level < maxLevel) return { level: level + 1, recent: [] }
  return { level, recent: history }
}

export const QUESTIONS_PER_MISSION = 8

/**
 * A mission round: two warm-up questions from the step below (revision), then questions from the current
 * step, no question twice. Pure with a seeded `r` (tested).
 */
export function makeRound(subject: Subject, level: number, r: Random = Math.random, count = QUESTIONS_PER_MISSION): Question[] {
  const steps = LADDERS[subject]
  const now = steps[Math.max(0, Math.min(level, steps.length - 1))]
  const before = level > 0 ? steps[level - 1] : null
  const out: Question[] = []
  const key = (q: Question) => JSON.stringify([q.prompt, q.visual])
  for (let guard = 0; out.length < count && guard < count * 30; guard++) {
    const step = before && out.length < 2 ? before : now
    const q = step.make(r)
    if (!out.some((o) => key(o) === key(q))) out.push(q)
  }
  return out
}
