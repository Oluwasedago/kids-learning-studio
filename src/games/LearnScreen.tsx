import { useState } from 'react'
import { ITEMS, SUBJECTS, type Subject } from '@/access/catalogue'
import { useStudio } from '@/app/studio'
import { useLang, useT } from '@/i18n'
import { LADDERS, stageTags } from '@/lessons/ladder'
import { skillName } from '@/lessons/text'
import { LibraryScreen, type Shelf } from '@/library/LibraryScreen'
import { MissionScreen } from '@/missions/MissionScreen'
import { ItemTile } from '@/rewards/ItemTile'
import { levelOf } from '@/progress/progress'
import { Emoji } from '@/shared/Emoji'
import './Games.css'

/** A pastel card colour per subject (CSS tokens, so dark mode works). */
const COLORS: Record<Subject, string> = { maths: 'var(--sky-soft)', english: 'var(--accent-soft)', world: 'var(--peach-soft)', patterns: 'var(--lilac-soft)' }

/** Learn: every enabled subject with the skill being practised now; any of them can be practised at any time. */
export function LearnScreen() {
  const t = useT()
  const { accessOf, progress, stage } = useStudio()
  const lang = useLang()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [shelf, setShelf] = useState<Shelf | null>(null)
  const subjects = SUBJECTS.filter((s) => accessOf(s) !== 'hidden')

  return (
    <div className="games-screen">
      {subjects.map((s) => {
        const steps = LADDERS[s]
        const level = Math.min(levelOf(progress, s, stage), steps.length - 1)
        const step = steps[level]
        const tags = stageTags(step.stage)
        return (
          <button key={s} className="game-card learn-card" style={{ background: COLORS[s] }} onClick={() => setSubject(s)}>
            <Emoji name={ITEMS[s].emoji} size={84} className="game-emoji" />
            <h3>{t.items[s]}</h3>
            <p>{skillName(step, lang)}</p>
            <span className="game-learn">
              {t.learn.step(level + 1, steps.length)} · {t.learn.about(tags.cambridge)}
            </span>
            <span className="game-go">{t.learn.practise}</span>
          </button>
        )
      })}
      {(['animals', 'places'] as const).map((id) => (
        <ItemTile key={id} id={id} className="game-card library-tile" onOpen={() => setShelf(id)}>
          <span className="game-learn">{t.itemLearn[id]}</span>
        </ItemTile>
      ))}
      {subject && <MissionScreen subject={subject} onClose={() => setSubject(null)} />}
      {shelf && <LibraryScreen shelf={shelf} onClose={() => setShelf(null)} />}
    </div>
  )
}
