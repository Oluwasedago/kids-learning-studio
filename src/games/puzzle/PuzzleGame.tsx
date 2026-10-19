import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import { newPuzzle, type Order, solved, swap, tilePosition } from './puzzle'
import './Puzzle.css'

/** Pictures to choose from: animals from the bundled emoji (no photos are needed or uploaded). */
const PICTURES = ['animal-lion', 'animal-panda', 'animal-turtle', 'animal-dolphin', 'animal-owl', 'animal-butterfly', 'animal-elephant', 'animal-fox', 'animal-parrot'].map(
  (a) => `${import.meta.env.BASE_URL}emoji/${a}.png`,
)

/** A picture on a white square, as a data URL (the emoji are see-through); the source if that fails. */
async function square(src: string): Promise<string> {
  const img = new Image()
  img.src = src
  await img.decode()
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(side, 900)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

/** Choose a picture and a size, then swap tiles until the picture is whole. */
export function PuzzleGame() {
  const t = useT()
  const [picture, setPicture] = useState<string | null>(null)
  const [n, setN] = useState(3)
  const [order, setOrder] = useState<Order>(() => newPuzzle(3))
  const [picked, setPicked] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const done = picture !== null && solved(order)

  const start = async (src: string, size = n) => {
    let s = src
    try {
      s = await square(src)
    } catch {
      // The picture as it is.
    }
    setPicture(s)
    setN(size)
    setOrder(newPuzzle(size))
    setPicked(null)
    setMoves(0)
  }
  const tap = (pos: number) => {
    if (done) return
    if (picked === null) return setPicked(pos)
    if (picked !== pos) {
      setOrder(swap(order, picked, pos))
      setMoves((m) => m + 1)
    }
    setPicked(null)
  }

  if (!picture) {
    return (
      <section className="card puzzle-choose">
        <h3 className="card-title">{t.games.choosePicture}</h3>
        <div className="puzzle-choices">
          {PICTURES.map((src) => (
            <button key={src} className="puzzle-choice" onClick={() => void start(src)}>
              <img src={src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="puzzle">
      <div className="puzzle-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {order.map((tile, pos) => (
          <button
            key={pos}
            className={`puzzle-tile ${picked === pos ? 'picked' : ''} ${done ? 'done' : ''}`}
            style={{ backgroundImage: `url(${picture})`, backgroundSize: `${n * 100}% ${n * 100}%`, backgroundPosition: tilePosition(tile, n) }}
            onClick={() => tap(pos)}
            aria-label={`${pos + 1}`}
          />
        ))}
      </div>
      <aside className="card puzzle-side">
        <img className="puzzle-preview" src={picture} alt="" />
        <p className="memory-moves">
          <b>{moves}</b> {t.games.moves}
        </p>
        {done && (
          <p className="memory-done">
            <Emoji name="party" size={36} /> {t.games.puzzleDone}
          </p>
        )}
        <span className="field-label">{t.games.size}</span>
        <div className="segmented">
          {[3, 4].map((s) => (
            <button key={s} className={n === s ? '' : 'secondary'} onClick={() => void start(picture, s)}>
              {s} × {s}
            </button>
          ))}
        </div>
        <button onClick={() => void start(picture)}>
          <RotateCcw /> {t.games.again}
        </button>
        <button className="secondary" onClick={() => setPicture(null)}>
          <ArrowLeft /> {t.games.otherPicture}
        </button>
      </aside>
    </div>
  )
}
