import { useState } from 'react'
import { earnedMinutes } from '@/access/access'
import { ITEMS, itemsIn, type ItemId, type Subject } from '@/access/catalogue'
import type { Score } from '@/data/types'
import { useLang, useT } from '@/i18n'
import { DidYouKnow } from '@/learn/DidYouKnow'
import { CallsCard } from '@/media/CallsCard'
import { animalOfTheDay } from '@/lessons/data'
import { animalName } from '@/lessons/text'
import { starsFor } from '@/lessons/ladder'
import { LibraryScreen, type Shelf } from '@/library/LibraryScreen'
import { MissionScreen } from '@/missions/MissionScreen'
import { missionsFor, scoreOf, starsOn, weekStars } from '@/progress/progress'
import { StreakCard } from '@/progress/StreakCard'
import { StarTrack } from '@/progress/StarTrack'
import { ItemTile } from '@/rewards/ItemTile'
import { clock } from '@/shared/clock'
import { daysUntilDate, isoDate } from '@/shared/date'
import { dayPart } from '@/shared/dayPart'
import { Emoji } from '@/shared/Emoji'
import { useStudio } from './studio'
import './Home.css'

/** The home screen: today's missions first, then what they earn. Big targets, pictures before words. */
export function Home({ onPlay }: { onPlay: (id: ItemId) => void }) {
  const { now, settings, progress } = useStudio()
  const missions = missionsFor(now, settings.access, settings.rewards.missionsPerDay)
  const done = new Set(progress.missions[isoDate(now)] ?? [])
  /** The missions card lights up when a locked tile is tapped. */
  const [nudge, setNudge] = useState(0)
  const [mission, setMission] = useState<Subject | null>(null)
  /** The library opens straight from the home screen (places of the world were hard to find on Learn). */
  const [shelf, setShelf] = useState<Shelf | null>(null)
  const tiles = [...itemsIn('games'), ...itemsIn('media')].filter((id) => ITEMS[id].ready)

  return (
    <div className="home-wrap">
      <div className="home">
        <Hero left={missions.filter((m) => !done.has(m)).length} total={missions.length} />
        <MissionsCard key={nudge} missions={missions} done={done} onStart={setMission} nudge={nudge > 0} />
        <div className="home-side">
          <StreakCard />
          <EarnedCard />
          <CallsCard />
          <BirthdaysCard />
        </div>
        <section className="play-row">
          {(['places', 'animals'] as const).map((id) => (
            <ItemTile key={id} id={id} onOpen={() => setShelf(id)} />
          ))}
          {tiles.map((id) => (
            <ItemTile key={id} id={id} onOpen={() => onPlay(id)} onLocked={() => setNudge((n) => n + 1)} />
          ))}
        </section>
        {mission && <MissionScreen subject={mission} onClose={() => setMission(null)} />}
        {shelf && <LibraryScreen shelf={shelf} onClose={() => setShelf(null)} />}
      </div>
      <DidYouKnow />
    </div>
  )
}

function Hero({ left, total }: { left: number; total: number }) {
  const t = useT()
  const { now, settings, progress } = useStudio()
  const animal = animalOfTheDay(now)
  const lang = useLang()
  return (
    <section className="hero card">
      <div className="hero-text">
        <h2>{t.home.greeting(dayPart(now), settings.child.name)}</h2>
        <p className="hero-sub">{total === 0 ? t.home.noMissions : t.home.subline(total - left, total)}</p>
        <div className="hero-badges">
          <span className="badge">
            <Emoji name="glowstar" size={30} />
            <b>{starsOn(progress, now)}</b> {t.home.starsToday(starsOn(progress, now))}
          </span>
        </div>
      </div>
      <div className="hero-animal" title={animal.fact}>
        <Emoji name={`animal-${animal.id}`} size={92} />
        <small>{t.home.animalOfDay}</small>
        <b>{animalName(animal.id, lang)}</b>
      </div>
      <div className="hero-track">
        <StarTrack have={weekStars(progress, now)} goal={settings.rewards.weeklyGoal} reward={settings.rewards.weeklyReward} />
      </div>
    </section>
  )
}

/** A mission's ring: empty until done; then green for answers right at the first try and red for the rest. */
function Ring({ emoji, score }: { emoji: string; score: Score | null }) {
  const r = 34
  const c = 2 * Math.PI * r
  const green = score ? (score.right / score.total) * c : 0
  return (
    <div className="ring">
      <svg viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r={r} className="ring-track" />
        {score && green < c && <circle cx="40" cy="40" r={r} className="ring-fill ring-red" style={{ strokeDasharray: `${c - green} ${c}`, strokeDashoffset: -green }} />}
        {score && green > 0 && <circle cx="40" cy="40" r={r} className="ring-fill ring-green" style={{ strokeDasharray: `${green} ${c}` }} />}
      </svg>
      <Emoji name={emoji} size={42} />
      {score && <Emoji name="star" size={26} className="ring-star" />}
    </div>
  )
}

function MissionsCard({ missions, done, onStart, nudge }: { missions: Subject[]; done: Set<string>; onStart: (m: Subject) => void; nudge: boolean }) {
  const t = useT()
  const { now, progress } = useStudio()
  const count = missions.filter((m) => done.has(m)).length
  return (
    <section className={`card missions ${nudge ? 'nudge' : ''}`}>
      <div className="missions-head">
        <h3 className="card-title">{t.home.missions}</h3>
        {missions.length > 0 && <span className="pill">{t.home.missionsDone(count, missions.length)}</span>}
      </div>
      {missions.length > 0 && (
        <div className="missions-bar">
          <span style={{ width: `${(100 * count) / missions.length}%` }} />
        </div>
      )}
      <div className="missions-rings">
        {missions.map((id) => (
          <button key={id} className={`mission ${done.has(id) ? 'done' : ''}`} onClick={() => onStart(id)}>
            <Ring emoji={ITEMS[id].emoji} score={scoreOf(progress, id, now)} />
            <b>{t.items[id]}</b>
            <small>{done.has(id) ? t.mission.again : t.mission.start}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

function EarnedCard() {
  const t = useT()
  const { progress, settings, today, earnedLeft } = useStudio()
  const earned = earnedMinutes(progress, settings.rewards, today)
  return (
    <section className="card earned-card">
      <h3 className="card-title">
        <Emoji name="clock" size={40} />
        {t.home.earnedTitle}
      </h3>
      <p className="earned-big">{earnedLeft > 0 ? clock(earnedLeft) : '0:00'}</p>
      <p className="muted">{earned === 0 ? t.home.earnHow(settings.rewards.minutesPerStar, starsFor(settings.rewards.questionsPerMission)) : t.home.earnedOf(earned)}</p>
    </section>
  )
}

function BirthdaysCard() {
  const t = useT()
  const { now, settings } = useStudio()
  const next = settings.birthdays
    .map((b) => ({ b, days: daysUntilDate(b.month, b.day, now) }))
    .filter((x) => x.days <= 45)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)
  if (next.length === 0) return null
  return (
    <section className="card birthdays-card">
      <h3 className="card-title">
        <Emoji name="cake" size={40} />
        {t.home.birthdays}
      </h3>
      {next.map(({ b, days }) => (
        <div key={b.id} className="birthday-row">
          <b>{b.name}</b>
          <span className={`pill ${days === 0 ? 'today' : ''}`}>{t.home.inDays(days)}</span>
        </div>
      ))}
    </section>
  )
}
