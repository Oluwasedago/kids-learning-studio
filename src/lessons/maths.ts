import { FRUITS } from './data'
import { int, numberQuestion, pick, type Random } from './question'
import type { Step } from './step'
import { type LessonText, lessonText } from './text'

// Maths ladder: counting → number bonds → place value → times tables → bigger numbers → fractions.

const COUNTABLE = FRUITS.slice(0, 8)

function count(r: Random, T: LessonText, min: number, max: number) {
  const fruit = pick(r, COUNTABLE)
  const n = int(r, min, max)
  return numberQuestion(r, T.howMany, n, { kind: 'emoji', name: `fruit-${fruit.id}`, count: n }, [1, -1, 2, -2])
}

function add(r: Random, T: LessonText, max: number, minB = 1) {
  const a = int(r, 1, max - minB)
  const b = int(r, minB, max - a)
  return numberQuestion(r, T.sum(a, '+', b), a + b, { kind: 'text', text: `${a} + ${b}` })
}

function subtract(r: Random, T: LessonText, max: number) {
  const a = int(r, 2, max)
  const b = int(r, 1, a - 1)
  return numberQuestion(r, T.sum(a, '−', b), a - b, { kind: 'text', text: `${a} − ${b}` })
}

function times(r: Random, T: LessonText, tables: number[], upTo = 10) {
  const t = pick(r, tables)
  const n = int(r, 1, upTo)
  return numberQuestion(r, T.sum(n, '×', t), n * t, { kind: 'text', text: `${n} × ${t}` }, [t, -t, 1, -1, 2])
}

export const MATHS: Step[] = [
  { id: 'count-5', stage: 0, skill: 'Counting to 5', make: (r, l) => count(r, lessonText(l), 1, 5) },
  { id: 'count-10', stage: 0, skill: 'Counting to 10', make: (r, l) => count(r, lessonText(l), 4, 10) },
  {
    id: 'more-less-10',
    stage: 1,
    skill: 'One more and one less within 10',
    make: (r, l) => {
      const T = lessonText(l)
      const n = int(r, 1, 9)
      return r() < 0.5
        ? numberQuestion(r, T.oneMore(n), n + 1, { kind: 'text', text: `${n} + 1` })
        : numberQuestion(r, T.oneLess(n), n - 1, { kind: 'text', text: `${n} − 1` })
    },
  },
  { id: 'add-10', stage: 1, skill: 'Adding within 10', make: (r, l) => add(r, lessonText(l), 10) },
  { id: 'sub-10', stage: 1, skill: 'Taking away within 10', make: (r, l) => subtract(r, lessonText(l), 10) },
  {
    id: 'after-20',
    stage: 1,
    skill: 'Numbers to 20: before and after',
    make: (r, l) => {
      const T = lessonText(l)
      const n = int(r, 2, 19)
      return r() < 0.5
        ? numberQuestion(r, T.after(n), n + 1, { kind: 'text', text: `${n}, ?` })
        : numberQuestion(r, T.before(n), n - 1, { kind: 'text', text: `?, ${n}` })
    },
  },
  { id: 'add-sub-20', stage: 2, skill: 'Adding and taking away within 20', make: (r, l) => (r() < 0.5 ? add(r, lessonText(l), 20, 3) : subtract(r, lessonText(l), 20)) },
  {
    id: 'tens-ones',
    stage: 2,
    skill: 'Tens and ones (place value to 100)',
    make: (r, l) => {
      const T = lessonText(l)
      const t = int(r, 1, 9)
      const o = int(r, 0, 9)
      return numberQuestion(r, T.tensOnes(t, o), t * 10 + o, { kind: 'text', text: T.tensOnesShown(t, o) }, [10, -10, 1, -1])
    },
  },
  {
    id: 'add-sub-100-easy',
    stage: 2,
    skill: 'Adding and taking away tens within 100',
    make: (r, l) => {
      const T = lessonText(l)
      const a = int(r, 1, 9) * 10 + int(r, 0, 9)
      const b = int(r, 1, 5) * 10
      return a + b <= 99 && r() < 0.5
        ? numberQuestion(r, T.sum(a, '+', b), a + b, { kind: 'text', text: `${a} + ${b}` })
        : a > b
          ? numberQuestion(r, T.sum(a, '−', b), a - b, { kind: 'text', text: `${a} − ${b}` })
          : numberQuestion(r, T.sum(b, '+', a), a + b, { kind: 'text', text: `${b} + ${a}` })
    },
  },
  { id: 'times-2-5-10', stage: 2, skill: 'The 2, 5 and 10 times tables', make: (r, l) => times(r, lessonText(l), [2, 5, 10]) },
  { id: 'add-sub-100', stage: 3, skill: 'Adding and taking away within 100', make: (r, l) => (r() < 0.5 ? add(r, lessonText(l), 100, 8) : subtract(r, lessonText(l), 99)) },
  {
    id: 'times-3-4-8',
    stage: 3,
    skill: 'The 3, 4 and 8 times tables; doubles and halves',
    make: (r, l) => {
      const T = lessonText(l)
      if (r() < 0.7) return times(r, T, [3, 4, 8])
      const n = int(r, 3, 25)
      // Shown as sums (2 × n, 2n ÷ 2): the same in every language.
      return r() < 0.5
        ? numberQuestion(r, T.double(n), 2 * n, { kind: 'text', text: `2 × ${n}` })
        : numberQuestion(r, T.half(2 * n), n, { kind: 'text', text: `${2 * n} ÷ 2` })
    },
  },
  { id: 'times-all', stage: 4, skill: 'All times tables to 10 × 10', make: (r, l) => times(r, lessonText(l), [2, 3, 4, 5, 6, 7, 8, 9, 10]) },
  {
    id: 'add-sub-1000',
    stage: 4,
    skill: 'Adding and taking away within 1000',
    make: (r, l) => {
      const T = lessonText(l)
      const a = int(r, 100, 899)
      const b = int(r, 11, 99)
      return r() < 0.5
        ? numberQuestion(r, T.sum(a, '+', b), a + b, { kind: 'text', text: `${a} + ${b}` }, [10, -10, 1, -1, 100])
        : numberQuestion(r, T.sum(a, '−', b), a - b, { kind: 'text', text: `${a} − ${b}` }, [10, -10, 1, -1, 100])
    },
  },
  {
    id: 'divide',
    stage: 5,
    skill: 'Dividing with the times tables',
    make: (r, l) => {
      const t = int(r, 2, 10)
      const n = int(r, 2, 10)
      return numberQuestion(r, lessonText(l).sum(t * n, '÷', t), n, { kind: 'text', text: `${t * n} ÷ ${t}` }, [1, -1, 2, -2])
    },
  },
  {
    id: 'times-2digit',
    stage: 5,
    skill: 'Multiplying a 2-digit number by a 1-digit number',
    make: (r, l) => {
      const a = int(r, 11, 49)
      const b = int(r, 2, 9)
      return numberQuestion(r, lessonText(l).sum(a, '×', b), a * b, { kind: 'text', text: `${a} × ${b}` }, [b, -b, 10, -10])
    },
  },
  {
    id: 'fractions',
    stage: 6,
    skill: 'Fractions of amounts',
    make: (r, l) => {
      const d = pick(r, [2, 3, 4, 5] as const)
      const n = int(r, 2, 12) * d
      return numberQuestion(r, lessonText(l).fraction(d, n), n / d, { kind: 'text', text: `1/${d} × ${n}` })
    },
  },
]
