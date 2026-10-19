import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, RotateCcw } from 'lucide-react'
import { type PointerEvent, useEffect, useRef, useState } from 'react'
import { sayText, useCanSpeak } from '@/audio/say'
import { useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import { COLS, type Dir, type Fruit, type Level, newGame, ROWS, type SnakeState, step, stepMs, turn } from './snake'
import './Snake.css'

// Best score and preferences are a convenience for this device only (browser storage, not in backups).
const BEST = 'kls-snake-best'
const PREFS = 'kls-snake-prefs'
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST)) || 0
  } catch {
    return 0
  }
}
/** The last choice of speed and whether fruit names are read out, remembered on this device. */
const readPrefs = (): { level: Level; speak: boolean } => {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS) ?? '{}') as { level?: Level; speak?: boolean }
    return { level: p.level === 1 || p.level === 3 ? p.level : 2, speak: p.speak !== false }
  } catch {
    return { level: 2, speak: true }
  }
}

/** Fruit pictures, loaded once for the canvas. */
const pictures = new Map<string, HTMLImageElement>()
const picture = (id: string) => {
  let img = pictures.get(id)
  if (!img) {
    img = new Image()
    img.src = `${import.meta.env.BASE_URL}emoji/fruit-${id}.png`
    pictures.set(id, img)
  }
  return img
}

/**
 * Snake on a canvas. Steer by swiping on the board, with the arrow buttons, the keyboard or a game controller
 * (D-pad or left stick; A/X or Start to start). Each fruit eaten shows its name and is read out (can be off).
 */
export function SnakeGame() {
  const t = useT()
  const speaks = useCanSpeak()
  const canvas = useRef<HTMLCanvasElement>(null)
  const game = useRef<SnakeState>(newGame())
  const [view, setView] = useState({ eaten: 0, over: false })
  const [running, setRunning] = useState(false)
  const [word, setWord] = useState<Fruit | null>(null)
  const [best, setBest] = useState(readBest)
  const [prefs, setPrefs] = useState(readPrefs)
  const choose = (change: Partial<typeof prefs>) => {
    const next = { ...prefs, ...change }
    setPrefs(next)
    try {
      localStorage.setItem(PREFS, JSON.stringify(next))
    } catch {
      // Not remembered: the choice lasts until the game closes.
    }
  }
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const start = () => {
    game.current = newGame()
    setView({ eaten: 0, over: false })
    setWord(null)
    setRunning(true)
  }
  const steer = (dir: Dir) => {
    if (!running && !game.current.over) setRunning(true)
    game.current = turn(game.current, dir)
  }

  // Keyboard.
  useEffect(() => {
    const keys: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' }
    const down = (e: KeyboardEvent) => {
      const dir = keys[e.key]
      if (dir) {
        e.preventDefault()
        steer(dir)
      }
    }
    addEventListener('keydown', down)
    return () => removeEventListener('keydown', down)
  })

  // The game loop: steps at the current speed, draws every frame, reads the controller.
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    let padStart = false
    const loop = (now: number) => {
      const pad = (navigator.getGamepads?.() ?? []).find((p) => p !== null)
      if (pad) {
        const b = (i: number) => pad.buttons[i]?.pressed
        const [ax = 0, ay = 0] = pad.axes
        if (b(12) || ay < -0.6) steer('up')
        else if (b(13) || ay > 0.6) steer('down')
        else if (b(14) || ax < -0.6) steer('left')
        else if (b(15) || ax > 0.6) steer('right')
        const startPressed = Boolean(b(0) || b(9))
        if (startPressed && !padStart && (game.current.over || !running)) start()
        padStart = startPressed
      }
      if (running && !game.current.over && now - last >= stepMs(game.current.eaten, prefs.level)) {
        last = now
        const before = game.current
        game.current = step(before)
        if (game.current.eaten > before.eaten) {
          const fruit = before.fruit
          setWord(fruit)
          if (prefs.speak) sayText(fruit.name)
        }
        if (game.current.eaten !== before.eaten || game.current.over) {
          setView({ eaten: game.current.eaten, over: game.current.over })
          if (game.current.over && game.current.eaten > readBest()) {
            setBest(game.current.eaten)
            try {
              localStorage.setItem(BEST, String(game.current.eaten))
            } catch {
              // Not saved: only the best score is lost.
            }
          }
        }
      }
      if (!running) last = now
      draw(canvas.current, game.current, now)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
    // steer/start read refs and the latest `running`; restarting the loop on `running` is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, prefs])

  const down = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const up = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  return (
    <div className="snake">
      <div className="snake-board" onPointerDown={down} onPointerUp={up}>
        <div className="snake-stage">
          <canvas ref={canvas} />
          {(!running || view.over) && (
          <div className="snake-overlay">
            <Emoji name="snake" size={110} />
            {view.over && (
              <p>
                <b>{view.eaten}</b> {t.games.snakeEaten}
              </p>
            )}
            <button className="snake-go" onClick={start}>
              {view.over ? <RotateCcw /> : <Play fill="currentColor" />}
              {view.over ? t.games.again : t.games.snakeStart}
            </button>
            <div className="snake-options">
              <span>{t.games.snakeSpeed}</span>
              {([1, 2, 3] as const).map((l) => (
                <button key={l} className={prefs.level === l ? '' : 'secondary'} onClick={() => choose({ level: l })}>
                  {t.games.snakeLevels[l]}
                </button>
              ))}
            </div>
            {speaks && (
              <div className="snake-options">
                <span>{t.games.snakeSay}</span>
                {([true, false] as const).map((on) => (
                  <button key={String(on)} className={prefs.speak === on ? '' : 'secondary'} onClick={() => choose({ speak: on })}>
                    {on ? t.common.on : t.common.off}
                  </button>
                ))}
              </div>
            )}
            <small>{t.games.snakeHelp}</small>
          </div>
          )}
        </div>
      </div>
      <aside className="snake-side">
        <div className="card snake-score">
          <span>
            <small>{t.games.snakeScore}</small>
            <b>{view.eaten}</b>
          </span>
          <span>
            <small>{t.games.snakeBest}</small>
            <b>{best}</b>
          </span>
        </div>
        <div className="card snake-word">
          {word ? (
            <>
              <Emoji name={`fruit-${word.id}`} size={64} />
              <b>{word.name}</b>
            </>
          ) : (
            <span className="snake-word-hint">{t.games.snakeLearn}</span>
          )}
        </div>
        <div className="snake-pad" aria-label={t.games.controls}>
          <button className="pad-up" onClick={() => steer('up')} aria-label="↑">
            <ArrowUp />
          </button>
          <button className="pad-left" onClick={() => steer('left')} aria-label="←">
            <ArrowLeft />
          </button>
          <button className="pad-right" onClick={() => steer('right')} aria-label="→">
            <ArrowRight />
          </button>
          <button className="pad-down" onClick={() => steer('down')} aria-label="↓">
            <ArrowDown />
          </button>
        </div>
      </aside>
    </div>
  )
}

/** Draws the board, the fruit (gently bobbing) and the snake (colours along its body, eyes on the head). */
function draw(el: HTMLCanvasElement | null, s: SnakeState, now: number) {
  if (!el) return
  // The board area (the stage around the canvas only wraps it).
  const box = el.parentElement!.parentElement!.getBoundingClientRect()
  const cell = Math.floor(Math.min(box.width / COLS, box.height / ROWS))
  const w = cell * COLS
  const h = cell * ROWS
  const dpr = window.devicePixelRatio || 1
  if (el.width !== w * dpr || el.height !== h * dpr) {
    el.width = w * dpr
    el.height = h * dpr
    el.style.width = `${w}px`
    el.style.height = `${h}px`
  }
  const ctx = el.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Two-tone grass.
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#a2d149' : '#aad751'
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }

  // Fruit.
  const img = picture(s.fruit.id)
  const bob = Math.sin(now / 250) * cell * 0.06
  if (img.complete) ctx.drawImage(img, s.food.x * cell - cell * 0.1, s.food.y * cell - cell * 0.1 + bob, cell * 1.2, cell * 1.2)

  // Snake: a round segment per cell, from pink at the head to violet at the tail.
  const n = s.body.length
  for (let i = n - 1; i >= 0; i--) {
    const c = s.body[i]
    const k = n > 1 ? i / (n - 1) : 0
    ctx.fillStyle = `hsl(${330 - k * 70} 75% ${58 - k * 8}%)`
    const r = cell * (i === 0 ? 0.5 : 0.44)
    ctx.beginPath()
    ctx.arc(c.x * cell + cell / 2, c.y * cell + cell / 2, r, 0, Math.PI * 2)
    ctx.fill()
    // Fill the gap to the next segment (not across the edge, where the snake comes out on the other side).
    const next = s.body[i - 1]
    if (next && Math.abs(next.x - c.x) + Math.abs(next.y - c.y) === 1) {
      const mx = Math.min(c.x, next.x) * cell + (c.x === next.x ? cell / 2 - r : cell / 2)
      const my = Math.min(c.y, next.y) * cell + (c.y === next.y ? cell / 2 - r : cell / 2)
      ctx.fillRect(mx, my, c.x === next.x ? r * 2 : cell, c.y === next.y ? r * 2 : cell)
    }
  }

  // Eyes, looking where the snake goes.
  const head = s.body[0]
  const look = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[s.dir]
  const cx = head.x * cell + cell / 2
  const cy = head.y * cell + cell / 2
  for (const side of [-1, 1]) {
    const ex = cx + look[0] * cell * 0.12 + (look[1] !== 0 ? side * cell * 0.2 : 0)
    const ey = cy + look[1] * cell * 0.12 + (look[0] !== 0 ? side * cell * 0.2 : 0)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(ex, ey, cell * 0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2b1633'
    ctx.beginPath()
    ctx.arc(ex + look[0] * cell * 0.05, ey + look[1] * cell * 0.05, cell * 0.075, 0, Math.PI * 2)
    ctx.fill()
  }
}
