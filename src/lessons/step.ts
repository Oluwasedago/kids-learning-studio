import type { Question, Random } from './question'

/**
 * One step on a subject's skills ladder: a skill, the Cambridge Primary stage it belongs to, and a question maker.
 * Stage 0 = before Stage 1 (early years). See ladder.ts for how stages map to ages and other school systems.
 */
export interface Step {
  id: string
  stage: number
  /** What the child practises, for parents ("Adding within 20"). */
  skill: string
  make: (r: Random) => Question
}
