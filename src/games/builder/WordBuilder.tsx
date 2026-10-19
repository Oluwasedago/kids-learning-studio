import { ArrowRight, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { sayText, useCanSpeak } from '@/audio/say'
import { useT } from '@/i18n'
import { WORDS } from '@/lessons/data'
import { shuffled } from '@/lessons/question'
import { Emoji } from '@/shared/Emoji'
import { newRound, nextIs, playable } from './builder'
import './Builder.css'

/**
 * Word builder: tap the letters in the right order. A right letter jumps into the next gap; a wrong one shakes
 * and stays, so the child can try again. Hearing the word is one tap on the speaker (when the device can speak).
 */
export function WordBuilder() {
  const t = useT()
  const speaks = useCanSpeak()
  const [queue] = useState(() => shuffled(playable(WORDS)))
  const [count, setCount] = useState(0)
  const [round, setRound] = useState(() => newRound(queue[0]))
  const [used, setUsed] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const built = used.map((i) => round.tiles[i]).join('')
  const done = built === round.target

  const next = () => {
    const n = count + 1
    setCount(n)
    setRound(newRound(queue[n % queue.length]))
    setUsed([])
    setWrong(null)
  }
  const tap = (i: number) => {
    if (done || used.includes(i)) return
    if (nextIs(round, built, round.tiles[i])) {
      setUsed([...used, i])
      setWrong(null)
    } else setWrong(i)
  }

  return (
    <div className="builder">
      <section className="card builder-stage">
        <div className="builder-picture">
          <Emoji name={round.word.emoji} size={150} />
          {speaks && (
            <button className="secondary builder-hear" onClick={() => sayText(round.word.word)} aria-label={t.mission.hear}>
              <Volume2 />
            </button>
          )}
        </div>
        <div className="builder-word">
          {[...round.target].map((letter, i) => (
            <span key={i} className={`builder-slot ${i < built.length ? 'filled' : ''}`}>
              {i < built.length ? letter : ''}
            </span>
          ))}
        </div>
        {done ? (
          <button className="builder-next" onClick={next}>
            {t.games.great} <ArrowRight />
          </button>
        ) : (
          <div className="builder-tiles">
            {round.tiles.map((letter, i) => (
              <button
                key={i}
                className={`builder-tile ${used.includes(i) ? 'used' : ''} ${wrong === i ? 'shake' : ''}`}
                onClick={() => tap(i)}
                onAnimationEnd={() => setWrong(null)}
                disabled={used.includes(i)}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </section>
      <aside className="card builder-side">
        <p className="memory-moves">
          <b>{count}</b> {t.games.words}
        </p>
        <small className="muted">{t.games.builderLearn}</small>
      </aside>
    </div>
  )
}
