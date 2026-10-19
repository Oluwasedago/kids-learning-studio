import { describe, expect, it } from 'vitest'
import { COLS, FRUITS, newGame, ROWS, type SnakeState, step, stepMs, turn } from './snake'

const fixed = () => 0

describe('snake', () => {
  it('moves one cell in its direction', () => {
    const s = step(newGame(fixed), fixed)
    expect(s.body[0]).toEqual({ x: 7, y: Math.floor(ROWS / 2) })
    expect(s.body).toHaveLength(3)
  })

  it('ignores turning straight back', () => {
    const s = newGame(fixed)
    expect(turn(s, 'left')).toBe(s)
    expect(turn(s, 'up').next).toBe('up')
  })

  it('comes out on the other side instead of hitting a wall', () => {
    const s: SnakeState = { ...newGame(fixed), body: [{ x: COLS - 1, y: 0 }, { x: COLS - 2, y: 0 }], food: { x: 5, y: 5 } }
    expect(step(s, fixed).body[0]).toEqual({ x: 0, y: 0 })
  })

  it('grows, counts and places new fruit when eating', () => {
    const s0 = newGame(fixed)
    const s: SnakeState = { ...s0, food: { x: 7, y: s0.body[0].y } }
    const after = step(s, fixed)
    expect(after.eaten).toBe(1)
    expect(after.body).toHaveLength(4)
    expect(after.body.some((c) => c.x === after.food.x && c.y === after.food.y)).toBe(false)
    expect(FRUITS).toContain(after.fruit)
  })

  it('ends when the head bites the body', () => {
    const body = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }]
    const s: SnakeState = { ...newGame(fixed), body, dir: 'up', next: 'down', food: { x: 0, y: 0 } }
    expect(step(s, fixed).over).toBe(true)
  })

  it('may move into the cell the tail is leaving', () => {
    const body = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }]
    const s: SnakeState = { ...newGame(fixed), body, dir: 'left', next: 'down', food: { x: 0, y: 0 } }
    expect(step(s, fixed).over).toBe(false)
  })

  it('speeds up gently, slower on level 1 and faster on level 3, within limits', () => {
    expect(stepMs(0)).toBe(230)
    expect(stepMs(5)).toBeLessThan(stepMs(0))
    expect(stepMs(500)).toBe(130)
    expect(stepMs(0, 1)).toBeGreaterThan(stepMs(0, 2))
    expect(stepMs(0, 3)).toBeLessThan(stepMs(0, 2))
    expect(stepMs(500, 1)).toBe(200)
    expect(stepMs(500, 3)).toBe(95)
  })
})
