import { RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'
import { useT } from '@/i18n'
import { WORDS } from '@/lessons/data'
import { Emoji } from '@/shared/Emoji'
import { isMatch, type MemoryCard, type MemoryMode, newBoard } from './memory'
import './Memory.css'

const SIZES = [6, 8, 10] as const

/** Memory: tap two cards; a pair stays open. Choose how many pairs and whether the second card is a word. */
export function MemoryGame() {
  const t = useT()
  const [mode, setMode] = useState<MemoryMode>('pictures')
  const [pairs, setPairs] = useState<(typeof SIZES)[number]>(6)
  const [board, setBoard] = useState<MemoryCard[]>(() => newBoard(WORDS, 6, 'pictures'))
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const done = found.size === pairs
  /** Turns two cards that do not match back over (a late one after closing the game does nothing). */
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const restart = (m = mode, p = pairs) => {
    setMode(m)
    setPairs(p)
    clearTimeout(timer.current)
    setBoard(newBoard(WORDS, p, m))
    setOpen([])
    setFound(new Set())
    setMoves(0)
  }

  const tap = (card: MemoryCard) => {
    if (open.length === 2 || open.includes(card.key) || found.has(card.pair)) return
    if (open.length === 0) return setOpen([card.key])
    setMoves((m) => m + 1)
    const first = board[open[0]]
    if (isMatch(first, card)) {
      setFound((f) => new Set(f).add(card.pair))
      setOpen([])
      return
    }
    setOpen([open[0], card.key])
    timer.current = setTimeout(() => setOpen([]), 1100)
  }

  return (
    <div className="memory">
      <div className="memory-board" style={{ gridTemplateColumns: `repeat(${pairs === 6 ? 4 : 5}, minmax(0, 1fr))` }}>
        {board.map((card) => {
          const shown = open.includes(card.key) || found.has(card.pair)
          return (
            <button key={card.key} className={`memory-card ${shown ? 'shown' : ''} ${found.has(card.pair) ? 'found' : ''}`} onClick={() => tap(card)}>
              {shown ? card.text ? <b>{card.text}</b> : <Emoji name={card.emoji} size={64} /> : <span className="memory-back">?</span>}
            </button>
          )
        })}
      </div>
      <aside className="card memory-side">
        <p className="memory-moves">
          <b>{moves}</b> {t.games.moves}
        </p>
        {done && <p className="memory-done">{t.games.memoryDone}</p>}
        <span className="field-label">{t.games.memoryMode}</span>
        <div className="segmented">
          {(['pictures', 'words'] as const).map((m) => (
            <button key={m} className={mode === m ? '' : 'secondary'} onClick={() => restart(m, pairs)}>
              {t.games.memoryModes[m]}
            </button>
          ))}
        </div>
        <span className="field-label">{t.games.pairs}</span>
        <div className="segmented">
          {SIZES.map((p) => (
            <button key={p} className={pairs === p ? '' : 'secondary'} onClick={() => restart(mode, p)}>
              {p}
            </button>
          ))}
        </div>
        <button className="memory-again" onClick={() => restart()}>
          <RotateCcw /> {t.games.again}
        </button>
      </aside>
    </div>
  )
}
