// Picture puzzle: a picture cut into n × n tiles, mixed up; tap two tiles to swap them until the picture is
// whole. Swapping instead of dragging suits small fingers. Pure (puzzle.test.ts).

/** order[position] = the tile (its place in the whole picture) that lies at that position. */
export type Order = number[]

export const solved = (order: Order) => order.every((tile, pos) => tile === pos)

/** A mixed-up order for an n × n puzzle, never already solved. */
export function newPuzzle(n: number, random = Math.random): Order {
  const order = Array.from({ length: n * n }, (_, i) => i)
  do {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
  } while (solved(order))
  return order
}

export function swap(order: Order, a: number, b: number): Order {
  const next = [...order]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/** Where tile `tile` of an n × n picture sits as a CSS background position ("0% 50%"). */
export function tilePosition(tile: number, n: number): string {
  const step = n > 1 ? 100 / (n - 1) : 0
  return `${(tile % n) * step}% ${Math.floor(tile / n) * step}%`
}
