// School classes: the parent picks the child's school system and class; the class decides the lesson level.
// Every class maps to a stage of the skills ladder (see the table in ladder.ts). Children in the same class
// can be different ages, so the class, not the age, sets the level.
//
// Status: the stage of each class is ASSUMED from the usual age of the children in it (Cambridge Primary
// Stages 1–6 for ages 5–11, England Year 1 at 5–6, US Kindergarten at 5–6, German Klasse 1 at 6–7, Nigerian
// Primary 1 at about 6); to verify against each curriculum (ROADMAP.md).

export type SchoolSystem = 'cambridge' | 'england' | 'us' | 'germany' | 'nigeria'

export interface SchoolClass {
  label: string
  stage: number
}

export const SCHOOL_SYSTEMS: { id: SchoolSystem; classes: SchoolClass[] }[] = [
  {
    id: 'cambridge',
    classes: [{ label: 'Early years', stage: 0 }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ label: `Stage ${n}`, stage: n }))],
  },
  {
    id: 'england',
    classes: [{ label: 'Reception', stage: 0 }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ label: `Year ${n}`, stage: n }))],
  },
  {
    id: 'us',
    classes: [{ label: 'Pre-K', stage: 0 }, { label: 'Kindergarten', stage: 1 }, ...[1, 2, 3, 4, 5].map((n) => ({ label: `Grade ${n}`, stage: n + 1 }))],
  },
  {
    id: 'germany',
    classes: [{ label: 'Kita', stage: 0 }, { label: 'Vorschule', stage: 1 }, ...[1, 2, 3, 4, 5].map((n) => ({ label: `Klasse ${n}`, stage: n + 1 }))],
  },
  {
    id: 'nigeria',
    classes: [{ label: 'Nursery 2', stage: 0 }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ label: `Primary ${n}`, stage: n }))],
  },
]

export const classesOf = (system: SchoolSystem) => SCHOOL_SYSTEMS.find((s) => s.id === system)?.classes ?? SCHOOL_SYSTEMS[0].classes

/** The class name for a stage in a school system ("Klasse 2"); the nearest class when there is no exact one. */
export function classLabel(system: SchoolSystem, stage: number): string {
  const classes = classesOf(system)
  return (classes.find((c) => c.stage === stage) ?? classes.reduce((a, b) => (Math.abs(b.stage - stage) < Math.abs(a.stage - stage) ? b : a))).label
}

/** A first guess of the school system from the device language (de → Germany, en-US → United States …). */
export function guessSystem(lang = typeof navigator === 'undefined' ? '' : navigator.language): SchoolSystem {
  const l = lang.toLowerCase()
  if (l.startsWith('de')) return 'germany'
  if (l === 'en-us') return 'us'
  if (l === 'en-gb') return 'england'
  if (l === 'en-ng') return 'nigeria'
  return 'cambridge'
}
