import { FRUITS } from './data'
import { int, numberQuestion, pick, type Random } from './question'
import type { Step } from './step'

// Maths ladder: counting → number bonds → place value → times tables → bigger numbers → fractions.

const COUNTABLE = FRUITS.slice(0, 8)

function count(r: Random, min: number, max: number) {
  const fruit = pick(r, COUNTABLE)
  const n = int(r, min, max)
  return numberQuestion(r, 'How many are there? Count carefully!', n, { kind: 'emoji', name: `fruit-${fruit.id}`, count: n }, [1, -1, 2, -2])
}

function add(r: Random, max: number, minB = 1) {
  const a = int(r, 1, max - minB)
  const b = int(r, minB, max - a)
  return numberQuestion(r, `What is ${a} + ${b}?`, a + b, { kind: 'text', text: `${a} + ${b}` })
}

function subtract(r: Random, max: number) {
  const a = int(r, 2, max)
  const b = int(r, 1, a - 1)
  return numberQuestion(r, `What is ${a} − ${b}?`, a - b, { kind: 'text', text: `${a} − ${b}` })
}

function times(r: Random, tables: number[], upTo = 10) {
  const t = pick(r, tables)
  const n = int(r, 1, upTo)
  return numberQuestion(r, `What is ${n} × ${t}?`, n * t, { kind: 'text', text: `${n} × ${t}` }, [t, -t, 1, -1, 2])
}

export const MATHS: Step[] = [
  { id: 'count-5', stage: 0, skill: 'Counting to 5', make: (r) => count(r, 1, 5) },
  { id: 'count-10', stage: 0, skill: 'Counting to 10', make: (r) => count(r, 4, 10) },
  {
    id: 'more-less-10',
    stage: 1,
    skill: 'One more and one less within 10',
    make: (r) => {
      const n = int(r, 1, 9)
      return r() < 0.5
        ? numberQuestion(r, `What is one more than ${n}?`, n + 1, { kind: 'text', text: `${n} + 1` })
        : numberQuestion(r, `What is one less than ${n}?`, n - 1, { kind: 'text', text: `${n} − 1` })
    },
  },
  { id: 'add-10', stage: 1, skill: 'Adding within 10', make: (r) => add(r, 10) },
  { id: 'sub-10', stage: 1, skill: 'Taking away within 10', make: (r) => subtract(r, 10) },
  {
    id: 'after-20',
    stage: 1,
    skill: 'Numbers to 20: before and after',
    make: (r) => {
      const n = int(r, 2, 19)
      return r() < 0.5
        ? numberQuestion(r, `Which number comes after ${n}?`, n + 1, { kind: 'text', text: `${n}, ?` })
        : numberQuestion(r, `Which number comes before ${n}?`, n - 1, { kind: 'text', text: `?, ${n}` })
    },
  },
  { id: 'add-sub-20', stage: 2, skill: 'Adding and taking away within 20', make: (r) => (r() < 0.5 ? add(r, 20, 3) : subtract(r, 20)) },
  {
    id: 'tens-ones',
    stage: 2,
    skill: 'Tens and ones (place value to 100)',
    make: (r) => {
      const t = int(r, 1, 9)
      const o = int(r, 0, 9)
      return numberQuestion(r, `${t} tens and ${o} ones make which number?`, t * 10 + o, { kind: 'text', text: `${t} tens + ${o} ones` }, [10, -10, 1, -1])
    },
  },
  {
    id: 'add-sub-100-easy',
    stage: 2,
    skill: 'Adding and taking away tens within 100',
    make: (r) => {
      const a = int(r, 1, 9) * 10 + int(r, 0, 9)
      const b = int(r, 1, 5) * 10
      return a + b <= 99 && r() < 0.5
        ? numberQuestion(r, `What is ${a} + ${b}?`, a + b, { kind: 'text', text: `${a} + ${b}` })
        : a > b
          ? numberQuestion(r, `What is ${a} − ${b}?`, a - b, { kind: 'text', text: `${a} − ${b}` })
          : numberQuestion(r, `What is ${b} + ${a}?`, a + b, { kind: 'text', text: `${b} + ${a}` })
    },
  },
  { id: 'times-2-5-10', stage: 2, skill: 'The 2, 5 and 10 times tables', make: (r) => times(r, [2, 5, 10]) },
  { id: 'add-sub-100', stage: 3, skill: 'Adding and taking away within 100', make: (r) => (r() < 0.5 ? add(r, 100, 8) : subtract(r, 99)) },
  {
    id: 'times-3-4-8',
    stage: 3,
    skill: 'The 3, 4 and 8 times tables; doubles and halves',
    make: (r) => {
      if (r() < 0.7) return times(r, [3, 4, 8])
      const n = int(r, 3, 25)
      return r() < 0.5
        ? numberQuestion(r, `What is double ${n}?`, 2 * n, { kind: 'text', text: `double ${n}` })
        : numberQuestion(r, `What is half of ${2 * n}?`, n, { kind: 'text', text: `half of ${2 * n}` })
    },
  },
  { id: 'times-all', stage: 4, skill: 'All times tables to 10 × 10', make: (r) => times(r, [2, 3, 4, 5, 6, 7, 8, 9, 10]) },
  {
    id: 'add-sub-1000',
    stage: 4,
    skill: 'Adding and taking away within 1000',
    make: (r) => {
      const a = int(r, 100, 899)
      const b = int(r, 11, 99)
      return r() < 0.5
        ? numberQuestion(r, `What is ${a} + ${b}?`, a + b, { kind: 'text', text: `${a} + ${b}` }, [10, -10, 1, -1, 100])
        : numberQuestion(r, `What is ${a} − ${b}?`, a - b, { kind: 'text', text: `${a} − ${b}` }, [10, -10, 1, -1, 100])
    },
  },
  {
    id: 'divide',
    stage: 5,
    skill: 'Dividing with the times tables',
    make: (r) => {
      const t = int(r, 2, 10)
      const n = int(r, 2, 10)
      return numberQuestion(r, `What is ${t * n} ÷ ${t}?`, n, { kind: 'text', text: `${t * n} ÷ ${t}` }, [1, -1, 2, -2])
    },
  },
  {
    id: 'times-2digit',
    stage: 5,
    skill: 'Multiplying a 2-digit number by a 1-digit number',
    make: (r) => {
      const a = int(r, 11, 49)
      const b = int(r, 2, 9)
      return numberQuestion(r, `What is ${a} × ${b}?`, a * b, { kind: 'text', text: `${a} × ${b}` }, [b, -b, 10, -10])
    },
  },
  {
    id: 'fractions',
    stage: 6,
    skill: 'Fractions of amounts',
    make: (r) => {
      const [name, d] = pick(r, [['half', 2], ['third', 3], ['quarter', 4], ['fifth', 5]] as const)
      const n = int(r, 2, 12) * d
      return numberQuestion(r, `What is one ${name} of ${n}?`, n / d, { kind: 'text', text: `1/${d} of ${n}` })
    },
  },
]
