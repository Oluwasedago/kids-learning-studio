import { ArrowLeft, Clock } from 'lucide-react'
import { type ComponentType, useEffect, useState } from 'react'
import { isOpen } from '@/access/access'
import { ITEMS, itemsIn, type ItemId } from '@/access/catalogue'
import { StatusBar } from '@/app/Shell'
import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { useArea } from '@/progress/usage'
import { ItemTile } from '@/rewards/ItemTile'
import { clock } from '@/shared/clock'
import { Emoji } from '@/shared/Emoji'
import { WordBuilder } from './builder/WordBuilder'
import { CodeBreaker } from './codebreaker/CodeBreaker'
import { MemoryGame } from './memory/MemoryGame'
import { PuzzleGame } from './puzzle/PuzzleGame'
import { SnakeGame } from './snake/SnakeGame'
import './Games.css'

const GAMES: Partial<Record<ItemId, ComponentType>> = { memory: MemoryGame, builder: WordBuilder, puzzle: PuzzleGame, snake: SnakeGame, codebreaker: CodeBreaker }

/** The games shelf: every enabled game as a tile (locked ones with a padlock). `start` opens one at once. */
export function GamesScreen({ start, onStarted }: { start?: ItemId | null; onStarted?: () => void }) {
  const t = useT()
  const { accessOf } = useStudio()
  const [playing, setPlaying] = useState<ItemId | null>(null)
  useEffect(() => {
    if (start && GAMES[start] && isOpen(accessOf(start))) setPlaying(start)
    if (start) onStarted?.()
    // Only when asked from the home screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start])

  return (
    <div className="games-screen">
      {itemsIn('games').map((id) => (
        <ItemTile key={id} id={id} onOpen={() => setPlaying(id)} className="game-tile">
          <small>{t.itemLearn[id]}</small>
        </ItemTile>
      ))}
      {playing && <GameFrame id={playing} onClose={() => setPlaying(null)} />}
    </div>
  )
}

/** A game full screen. Earned games count against today's earned time and close when it runs out. */
function GameFrame({ id, onClose }: { id: ItemId; onClose: () => void }) {
  const t = useT()
  const { accessOf, earnedLeft } = useStudio()
  const state = accessOf(id)
  const earned = state === 'earned'
  useArea(`game:${id}`, earned)
  const Game = GAMES[id]
  if (!isOpen(state)) return <TimeUp onClose={onClose} />

  return (
    <div className="game-frame">
      <StatusBar
        left={
          <>
            <button onClick={onClose}>
              <ArrowLeft /> {t.common.back}
            </button>
            <h2>
              <Emoji name={ITEMS[id].emoji} size={40} /> {t.items[id]}
            </h2>
            {earned && (
              <span className="pill cartoon-clock">
                <Clock /> {clock(earnedLeft)}
              </span>
            )}
          </>
        }
      />
      {Game && <Game />}
    </div>
  )
}

function TimeUp({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <div className="game-frame">
      <section className="card time-up">
        <Emoji name="moon" size={120} />
        <h2>{t.access.timeUpTitle}</h2>
        <p>{t.access.timeUpText}</p>
        <button onClick={onClose}>{t.common.back}</button>
      </section>
    </div>
  )
}
