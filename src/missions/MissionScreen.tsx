import { ArrowLeft, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { ITEMS, type Subject } from '@/access/catalogue'
import { StatusBar } from '@/app/Shell'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import type { Score } from '@/data/types'
import { useT } from '@/i18n'
import { LADDERS, makeRound } from '@/lessons/ladder'
import type { Choice, Visual } from '@/lessons/question'
import { completeMission, levelOf, missionsFor } from '@/progress/progress'
import { useArea } from '@/progress/usage'
import { Emoji } from '@/shared/Emoji'
import { CountryFlag } from './Flag'
import './Missions.css'

/**
 * A mission, full screen: 8 questions at the child's level, then a star. It counts as one of the day's missions
 * (a star) only when the subject is on today's list and not done yet; otherwise it is practice. Either way the
 * result moves the adaptive level.
 */
export function MissionScreen({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const t = useT()
  const { now, today, age, progress, settings, updateProgress } = useStudio()
  const [counts] = useState(() => missionsFor(now, settings.access, settings.rewards.missionsPerDay).includes(subject) && !(progress.missions[today] ?? []).includes(subject))
  const [level] = useState(() => levelOf(progress, subject, age))
  const [result, setResult] = useState<{ score: Score; levelAfter: number } | null>(null)
  useArea(`mission:${subject}`)

  const finish = (score: Score) => {
    let levelAfter = level
    updateProgress((p) => {
      const next = completeMission(p, subject, score, { day: now, age, counts })
      levelAfter = next.levels[subject] ?? level
      return next
    })
    setResult({ score, levelAfter })
  }

  return (
    <div className="mission-screen">
      <StatusBar
        left={
          <>
            <button className="secondary" onClick={onClose}>
              <ArrowLeft /> {t.common.back}
            </button>
            <h2>
              <Emoji name={ITEMS[subject].emoji} size={40} /> {t.items[subject]}
            </h2>
          </>
        }
      />
      {result ? (
        <section className="card mission-done">
          <Emoji name={counts ? 'glowstar' : 'sparkles'} size={150} className="mission-star" />
          <h2>{t.mission.doneTitle}</h2>
          <p>{t.mission.score(result.score.right, result.score.total)}</p>
          <p>{counts ? t.mission.doneText : t.mission.practiceText}</p>
          {result.levelAfter > level && <p className="pill">{t.mission.levelUp(LADDERS[subject][result.levelAfter].skill)}</p>}
          <button onClick={onClose}>{counts ? t.mission.backHome : t.common.back}</button>
        </section>
      ) : (
        <Quiz subject={subject} level={level} onDone={finish} />
      )}
    </div>
  )
}

function Quiz({ subject, level, onDone }: { subject: Subject; level: number; onDone: (score: Score) => void }) {
  const t = useT()
  const [round] = useState(() => makeRound(subject, level))
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const [right, setRight] = useState(false)
  /** Questions answered right at the first try. */
  const [firstTry, setFirstTry] = useState(0)
  const q = round[index]
  const speaks = useCanSpeak()

  const choose = (i: number) => {
    if (right || wrong.includes(i)) return
    if (i !== q.answer) {
      setWrong([...wrong, i])
      return
    }
    setRight(true)
    const total = firstTry + (wrong.length === 0 ? 1 : 0)
    setFirstTry(total)
    setTimeout(() => {
      if (index + 1 >= round.length) return onDone({ right: total, total: round.length })
      setIndex(index + 1)
      setWrong([])
      setRight(false)
    }, 1000)
  }

  return (
    <section className="card quiz">
      <div className="quiz-dots" aria-label={`${index + 1} / ${round.length}`}>
        {round.map((_, i) => (
          <i key={i} className={i < index || (i === index && right) ? 'done' : i === index ? 'now' : ''} />
        ))}
      </div>
      <div className="quiz-ask">
        <p>{q.prompt}</p>
        {speaks && (
          <button className="secondary quiz-hear" onClick={() => sayText(q.spoken ?? q.prompt)} aria-label={t.mission.hear}>
            <Volume2 />
          </button>
        )}
      </div>
      {q.visual && (
        <div className="quiz-visual">
          <VisualView visual={q.visual} big />
        </div>
      )}
      <div className="quiz-choices">
        {q.choices.map((c, i) => (
          <button key={i} className={`quiz-choice ${wrong.includes(i) ? 'wrong' : ''} ${right && i === q.answer ? 'right' : ''}`} onClick={() => choose(i)}>
            <ChoiceView choice={c} />
          </button>
        ))}
      </div>
    </section>
  )
}

function ChoiceView({ choice }: { choice: Choice }) {
  if (choice.visual) return <VisualView visual={choice.visual} />
  return <span className="quiz-label">{choice.label}</span>
}

function VisualView({ visual, big = false }: { visual: Visual; big?: boolean }) {
  if (visual.kind === 'text') return <span className={big ? 'quiz-sum' : 'quiz-label'}>{visual.text}</span>
  if (visual.kind === 'flag') return <CountryFlag id={visual.id} width={big ? 220 : 140} />
  if (visual.kind === 'pattern') {
    return (
      <span className="quiz-pattern">
        {visual.items.map((name, i) => (
          <Emoji key={i} name={name} size={60} />
        ))}
        <b className="quiz-gap">?</b>
      </span>
    )
  }
  if (visual.count) {
    return (
      <span className="quiz-count">
        {Array.from({ length: visual.count }, (_, i) => (
          <Emoji key={i} name={visual.name} size={56} />
        ))}
      </span>
    )
  }
  return <Emoji name={visual.name} size={big ? 140 : 80} />
}
