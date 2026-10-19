import { useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import './StarTrack.css'

/**
 * The star track: one stop per star of the weekly goal along a winding path; earned stars fill the stops; the
 * gift at the end is the parents' weekly reward. Starts again every Monday.
 */
export function StarTrack({ have, goal, reward }: { have: number; goal: number; reward: string }) {
  const t = useT()
  const stops = Math.max(1, goal)
  const left = Math.max(0, stops - have)
  const goalName = reward || t.home.trackGoal
  // Positions along the track (in % of the width) and a gentle wave up and down.
  const point = (i: number) => ({ x: 2 + (i / stops) * 90, y: 50 + Math.sin(i * 0.85) * 26 })
  const path = Array.from({ length: stops + 1 }, (_, i) => point(i))
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  return (
    <div className="track">
      <p className="track-label">
        <b>{t.home.trackTitle}</b> {left === 0 ? t.home.trackDone(goalName) : t.home.trackLeft(left, goalName)}
      </p>
      <div className="track-road">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d={path} className="track-line" vectorEffect="non-scaling-stroke" />
        </svg>
        {Array.from({ length: stops }, (_, i) => {
          const p = point(i)
          return (
            <span key={i} className={`track-stop ${i < have ? 'earned' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {i < have ? <Emoji name="star" size={30} /> : <i />}
            </span>
          )
        })}
        <span className={`track-stop track-goal ${left === 0 ? 'earned' : ''}`} style={{ left: `${point(stops).x}%`, top: `${point(stops).y}%` }}>
          <Emoji name="gift" size={44} />
        </span>
      </div>
    </div>
  )
}
