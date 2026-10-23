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

/** A mission is passed (ticked off, stars) with at least 70 % right: 7 of 10, 18 of 25, 35 of 50. Pure (tested). */
export const passMark = (total: number) => Math.ceil(total * 0.7 - 1e-9)

/** Stars for a passed mission: one per 10 questions, rounded (10 → 1, 25 → 3, 50 → 5). Pure (tested). */
export const starsFor = (total: number) => Math.max(1, Math.round(total / 10))

/** A round counts as strong at 85 % right or more, weak at half or less. */
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

/** Mission lengths a parent can choose; the default is the first. */
export const MISSION_LENGTHS = [10, 25, 50] as const
export const QUESTIONS_PER_MISSION = MISSION_LENGTHS[0]

/**
 * A mission round: a fifth warm-up questions from the step below (revision), then questions from the current
 * step, no question twice. When the current step has no new questions left (a long round on a small step,
 * like "a" or "an"), it goes on with revision from the steps below, and only then repeats a question, never
 * twice in a row. Pure with a seeded `r` (tested).
 */
export function makeRound(subject: Subject, level: number, r: Random = Math.random, count: number = QUESTIONS_PER_MISSION): Question[] {
  const steps = LADDERS[subject]
  const at = Math.max(0, Math.min(level, steps.length - 1))
  const warmUps = at > 0 ? Math.round(count / 5) : 0
  const out: Question[] = []
  const key = (q: Question) => JSON.stringify([q.prompt, q.visual, q.choices.map((c) => c.label ?? c.visual)])
  const seen = new Set<string>()
  /** Adds up to `n` new questions from a step; gives up on the step after many tries without a new one. */
  const fill = (step: Step, n: number, unique: boolean) => {
    for (let added = 0, misses = 0; added < n && misses < 60; ) {
      const q = { ...step.make(r), step: step.id }
      const k = key(q)
      const repeatOk = !unique && (out.length === 0 || key(out[out.length - 1]) !== k)
      if (!seen.has(k) || repeatOk) {
        seen.add(k)
        out.push(q)
        added++
        misses = 0
      } else misses++
    }
  }
  if (warmUps > 0) fill(steps[at - 1], warmUps, true)
  fill(steps[at], count - out.length, true)
  for (let below = at - 1; below >= 0 && out.length < count; below--) fill(steps[below], count - out.length, true)
  if (out.length < count) fill(steps[at], count - out.length, false)
  return out
}
