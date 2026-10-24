import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import { useLang, useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import { type CodeMode, makePuzzle, messageOrder, nextCell } from './code'
import './CodeBreaker.css'

/** Code breaker: decode a secret message letter by letter with the key (pictures or numbers). */
export function CodeBreaker() {
  const t = useT()
  const lang = useLang()
  const speaks = useCanSpeak(lang)
  const { settings } = useStudio()
  const [mode, setMode] = useState<CodeMode>('pictures')
  const [order, setOrder] = useState(() => messageOrder(lang))
  const [n, setN] = useState(0)
  const [puzzle, setPuzzle] = useState(() => makePuzzle(order[0], 'pictures'))
  const [solved, setSolved] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [cracked, setCracked] = useState(0)
  const at = nextCell(puzzle, solved)
  const done = at === -1

  const start = (m: CodeMode, index: number, list = order) => {
    setPuzzle(makePuzzle(list[index % list.length], m))
    setSolved(0)
    setWrong(null)
  }
  const next = () => {
    let list = order
    if (n + 1 >= order.length) {
      list = messageOrder(lang)
      setOrder(list)
    }
    const i = (n + 1) % list.length
    setN(i)
    start(mode, i, list)
  }
  const tap = (letter: string) => {
    if (done) return
    if (puzzle.cells[at].char !== letter) {
      setWrong(letter)
      setTimeout(() => setWrong(null), 600)
      return
    }
    const after = at + 1
    setSolved(after)
    if (nextCell(puzzle, after) === -1) {
      setCracked((c) => c + 1)
      if (speaks && settings.readAloud) sayText(puzzle.message.toLowerCase(), lang)
    }
  }
  const code = (c: string, size: number) => (mode === 'numbers' ? <span className="code-number">{c}</span> : <Emoji name={c} size={size} />)

  return (
    <div className="codebreaker">
      <div className="codebreaker-top">
        <div className="segmented" role="radiogroup" aria-label={t.games.codeMode}>
          {(['pictures', 'numbers'] as const).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={mode === m}
              className={mode === m ? '' : 'secondary'}
              onClick={() => {
                setMode(m)
                start(m, n)
              }}
            >
              {t.games.codeModes[m]}
            </button>
          ))}
        </div>
        <span className="pill">
          <Emoji name="key" size={24} /> {cracked} {t.games.cracked}
        </span>
      </div>

      <p className="codebreaker-help">{done ? t.games.codeDone : t.games.codeHelp}</p>

      <div className={`code-message ${done ? 'done' : ''}`}>
        {puzzle.message.split(' ').map((word, w, words) => {
          const start = words.slice(0, w).reduce((sum, x) => sum + x.length + 1, 0)
          return (
            <span key={w} className="code-word">
              {[...word].map((_, i) => {
                const k = start + i
                const cell = puzzle.cells[k]
                return (
                  <span key={k} className={`code-cell ${k === at ? 'now' : ''} ${k < solved ? 'solved' : ''}`}>
                    {code(cell.code!, 34)}
                    <b>{k < solved ? cell.char : ''}</b>
                  </span>
                )
              })}
            </span>
          )
        })}
        {done && speaks && (
          <button className="secondary code-say" onClick={() => sayText(puzzle.message.toLowerCase(), lang)} aria-label={t.mission.hear}>
            <Volume2 />
          </button>
        )}
      </div>

      {done ? (
        <button className="code-next" onClick={next}>
          {t.games.codeNext}
        </button>
      ) : (
        <div className="code-play">
          <div className={`code-key ${mode}`} aria-label={t.games.codeKey}>
            {puzzle.key.map((k) => (
              <span key={k.letter}>
                {code(k.code, 26)} = <b>{k.letter}</b>
              </span>
            ))}
          </div>
          <div className="code-keyboard">
            {puzzle.keyboard.map((l) => (
              <button key={l} className={`secondary ${wrong === l ? 'shake' : ''}`} onClick={() => tap(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
