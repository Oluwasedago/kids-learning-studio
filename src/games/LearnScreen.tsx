import { useState } from 'react'
import { ITEMS, SUBJECTS, type Subject } from '@/access/catalogue'
import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { LADDERS, stageTags } from '@/lessons/ladder'
import { DidYouKnow } from '@/learn/DidYouKnow'
import { MissionScreen } from '@/missions/MissionScreen'
import { levelOf } from '@/progress/progress'
import { Emoji } from '@/shared/Emoji'
import './Games.css'

/** A pastel card colour per subject (CSS tokens, so dark mode works). */
const COLORS: Record<Subject, string> = { maths: 'var(--sky-soft)', english: 'var(--accent-soft)', world: 'var(--peach-soft)', patterns: 'var(--lilac-soft)' }

/** Learn: every enabled subject with the skill being practised now; any of them can be practised at any time. */
export function LearnScreen() {
  const t = useT()
  const { accessOf, progress, age } = useStudio()
  const [subject, setSubject] = useState<Subject | null>(null)
  const subjects = SUBJECTS.filter((s) => accessOf(s) !== 'hidden')

  return (
    <div className="games-screen">
      {subjects.map((s) => {
        const steps = LADDERS[s]
        const level = Math.min(levelOf(progress, s, age), steps.length - 1)
        const step = steps[level]
        const tags = stageTags(step.stage)
        return (
          <button key={s} className="game-card learn-card" style={{ background: COLORS[s] }} onClick={() => setSubject(s)}>
            <Emoji name={ITEMS[s].emoji} size={84} className="game-emoji" />
            <h3>{t.items[s]}</h3>
            <p>{step.skill}</p>
            <span className="game-learn">
              {t.learn.step(level + 1, steps.length)} · {t.learn.about(tags.cambridge)}
            </span>
            <span className="game-go">{t.learn.practise}</span>
          </button>
        )
      })}
      <div className="learn-facts">
        <DidYouKnow />
      </div>
      {subject && <MissionScreen subject={subject} onClose={() => setSubject(null)} />}
    </div>
  )
}
