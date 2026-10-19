import { ArrowLeft, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { ITEMS, type Subject } from '@/access/catalogue'
import { StatusBar } from '@/app/Shell'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import type { Score } from '@/data/types'
import { useT } from '@/i18n'
import { COUNTRIES } from '@/lessons/data'
import { LADDERS, makeRound, passMark } from '@/lessons/ladder'
import type { Choice, Visual } from '@/lessons/question'
import { type Answer, completeMission, levelOf, missionsFor } from '@/progress/progress'
import { computeStreak, milestoneAt } from '@/progress/streak'
import '@/progress/Streak.css'
import { useArea } from '@/progress/usage'
import { Emoji } from '@/shared/Emoji'
import { CountryFlag } from './Flag'
import './Missions.css'

/**
 * A mission, full screen: 8 questions at the child's level, one try each. The tapped answer turns green when
 * right and red when wrong, but the right answer is never shown, so the child has to think rather than tap
 * until something turns green. The score comes at the end.
 * Passed (5 of 8 or more) and one of today's missions: ticked off with a star. Otherwise "not yet", and a new
 * try later with new questions in a new order. Either way the answers move the adaptive level and go into the
 * parents' report (which shows the right answers to the parents, never to the child).
 */
export function MissionScreen({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const t = useT()
  const { now, today, age, progress, settings, updateProgress } = useStudio()
  const isTodays = () => missionsFor(now, settings.access, settings.rewards.missionsPerDay).includes(subject) && !(progress.missions[today] ?? []).includes(subject)
  const [counts, setCounts] = useState(isTodays)
  const [level, setLevel] = useState(() => levelOf(progress, subject, age))
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<{ score: Score; levelAfter: number; milestone: number | null } | null>(null)
  useArea(`mission:${subject}`)

  const finish = (answers: Answer[]) => {
    let levelAfter = level
    let milestone: number | null = null
    updateProgress((p) => {
      const next = completeMission(p, subject, answers, { day: now, age, counts })
      levelAfter = next.levels[subject] ?? level
      // Today's first star can lift the streak to a milestone (3, 7, 14, 30 … days): celebrate it.
      const before = computeStreak(p.stars, now)
      const after = computeStreak(next.stars, now)
      if (after.current > before.current) milestone = milestoneAt(after.current)
      return next
    })
    setResult({ score: { right: answers.filter((a) => a.right).length, total: answers.length }, levelAfter, milestone })
  }
  const again = () => {
    setCounts(isTodays())
    setLevel(result?.levelAfter ?? level)
    setResult(null)
    setRound((n) => n + 1)
  }
  const passed = result !== null && result.score.right >= passMark(result.score.total)

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
          <Emoji name={passed ? (counts ? 'glowstar' : 'sparkles') : 'seedling'} size={150} className={passed ? 'mission-star' : ''} />
          <h2>{passed ? t.mission.doneTitle : t.mission.notYetTitle}</h2>
          <p>{t.mission.score(result.score.right, result.score.total)}</p>
          {result.milestone && (
            <p className="streak-milestone">
              <Emoji name="fire" size={36} /> {t.streak.milestone(result.milestone)}
            </p>
          )}
          <p>{passed ? (counts ? t.mission.doneText : t.mission.practiceText) : t.mission.notYetText(passMark(result.score.total))}</p>
          {result.levelAfter > level && <p className="pill">{t.mission.levelUp(LADDERS[subject][result.levelAfter].skill)}</p>}
          {result.levelAfter < level && <p className="pill">{t.mission.levelDown(LADDERS[subject][result.levelAfter].skill)}</p>}
          <div className="settings-buttons">
            {!passed && <button onClick={again}>{t.mission.tryAgain}</button>}
            <button className={passed ? '' : 'secondary'} onClick={onClose}>
              {passed && counts ? t.mission.backHome : t.common.back}
            </button>
          </div>
        </section>
      ) : (
        <Quiz key={round} subject={subject} level={level} onDone={finish} />
      )}
    </div>
  )
}

/** A choice as words, for the parents' report ("fox", "France", "12"). */
function describe(c: Choice): string {
  if (c.label !== undefined) return c.label
  const v = c.visual
  if (!v) return '?'
  if (v.kind === 'text') return v.text
  if (v.kind === 'flag') return `flag of ${COUNTRIES.find((x) => x.id === v.id)?.name ?? v.id}`
  if (v.kind === 'emoji') return `picture: ${v.name.replace(/^(animal|fruit)-/, '').replace(/-/g, ' ')}`
  return '?'
}

function Quiz({ subject, level, onDone }: { subject: Subject; level: number; onDone: (answers: Answer[]) => void }) {
  const t = useT()
  const [round] = useState(() => makeRound(subject, level))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const q = round[index]
  const speaks = useCanSpeak()

  const advance = (all: Answer[]) => {
    if (index + 1 >= round.length) return onDone(all)
    setIndex(index + 1)
    setPicked(null)
  }
  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const right = i === q.answer
    const all = [...answers, { step: q.step ?? '', prompt: q.prompt, given: describe(q.choices[i]), answer: describe(q.choices[q.answer]), right }]
    setAnswers(all)
    // The chosen answer turns green (right) or red (wrong) for a moment, then the next question.
    // The right answer is not revealed.
    setTimeout(() => advance(all), 900)
  }

  return (
    <section className="card quiz">
      <div className="quiz-dots" aria-label={`${index + 1} / ${round.length}`}>
        {round.map((_, i) => {
          const a = answers[i]
          return <i key={i} className={a ? (a.right ? 'done' : 'missed') : i === index ? 'now' : ''} />
        })}
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
          <button
            key={i}
            className={`quiz-choice ${picked === i ? (i === q.answer ? 'right' : 'wrong') : ''} ${picked !== null && picked !== i ? 'faded' : ''}`}
            onClick={() => choose(i)}
          >
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
