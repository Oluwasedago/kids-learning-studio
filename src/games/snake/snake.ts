import { FRUITS, type Fruit } from '@/lessons/data'

// Snake: the snake eats fruit; each fruit shows (and can say) its name, and the score counts up, so the child
// learns words and counting. Kind rules for a young player: no walls (the snake comes out on the other side),
// only biting itself ends the round, and it speeds up slowly. Pure functions (snake.test.ts).

export { FRUITS, type Fruit }

export const COLS = 22
export const ROWS = 13

export type Dir = 'up' | 'down' | 'left' | 'right'
export interface Cell {
  x: number
  y: number
}

export interface SnakeState {
  /** Head first. */
  body: Cell[]
  dir: Dir
  /** The direction asked for, applied on the next step (so two quick turns cannot reverse the snake). */
  next: Dir
  food: Cell
  fruit: Fruit
  eaten: number
  over: boolean
}

const MOVE: Record<Dir, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y

/** A free cell and a fruit for it; `random` returns 0 ≤ n < 1 (Math.random, or fixed in tests). */
export function placeFood(body: Cell[], random: () => number, eaten = 0): { food: Cell; fruit: Fruit } {
  const free: Cell[] = []
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!body.some((c) => c.x === x && c.y === y)) free.push({ x, y })
  const food = free[Math.floor(random() * free.length)] ?? { x: 0, y: 0 }
  // Fruits in turn, starting somewhere random, so every fruit comes up.
  const fruit = FRUITS[(eaten + Math.floor(random() * FRUITS.length)) % FRUITS.length]
  return { food, fruit }
}

export function newGame(random: () => number = Math.random): SnakeState {
  const y = Math.floor(ROWS / 2)
  const body = [{ x: 6, y }, { x: 5, y }, { x: 4, y }]
  return { body, dir: 'right', next: 'right', ...placeFood(body, random), eaten: 0, over: false }
}

/** Asks for a new direction; turning straight back is ignored (it would bite itself at once). */
export function turn(s: SnakeState, dir: Dir): SnakeState {
  if (s.over || dir === OPPOSITE[s.dir]) return s
  return { ...s, next: dir }
}

/** One step forward: through the edges, growing on fruit, over when the head hits the body. */
export function step(s: SnakeState, random: () => number = Math.random): SnakeState {
  if (s.over) return s
  const dir = s.next
  const m = MOVE[dir]
  const head = { x: (s.body[0].x + m.x + COLS) % COLS, y: (s.body[0].y + m.y + ROWS) % ROWS }
  const eats = same(head, s.food)
  // The tail moves away this step unless the snake eats, so moving into the tail's cell is allowed.
  const rest = eats ? s.body : s.body.slice(0, -1)
  if (rest.some((c) => same(c, head))) return { ...s, dir, over: true }
  const body = [head, ...rest]
  if (!eats) return { ...s, body, dir }
  return { ...s, body, dir, eaten: s.eaten + 1, ...placeFood(body, random, s.eaten + 1) }
}

export type Level = 1 | 2 | 3
/** Starting pace per level (ms per step): 1 slow, 2 medium, 3 fast. */
const START_MS: Record<Level, number> = { 1: 320, 2: 230, 3: 160 }
const FASTEST_MS: Record<Level, number> = { 1: 200, 2: 130, 3: 95 }

/** Milliseconds per step: the level's pace, a little faster every 5 fruits, never beyond the level's limit. */
export const stepMs = (eaten: number, level: Level = 2) => Math.max(FASTEST_MS[level], START_MS[level] - Math.floor(eaten / 5) * 15)
