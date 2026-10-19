import { useStudio } from '@/app/studio'
import { LOCALES, useLang, useT } from '@/i18n'
import { addDays, isoDate } from '@/shared/date'
import { Emoji } from '@/shared/Emoji'
import { computeStreak } from './streak'
import './Streak.css'

/**
 * The learning streak on the home screen: the flame and the number of days in a row, the last 7 days ending
 * today (flame = learned, snowflake = saved by a freeze), the freezes in hand, and a nudge when today is not
 * done yet.
 */
export function StreakCard() {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { progress, now, today } = useStudio()
  const s = computeStreak(progress.stars, now)
  const week = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6))
  return (
    <section className={`card streak-card ${s.learnedToday ? 'lit' : ''}`}>
      <div className="streak-head">
        <Emoji name="fire" size={s.current > 0 ? 52 : 40} className={s.current > 0 ? '' : 'streak-cold'} />
        <div>
          <b className="streak-number">{s.current}</b>
          <span>{t.streak.days(s.current)}</span>
        </div>
        {s.freezes > 0 && (
          <span className="pill streak-freezes" title={t.streak.freezeHelp}>
            <Emoji name="snowflake" size={22} /> {s.freezes}
          </span>
        )}
      </div>
      <div className="streak-week">
        {week.map((d) => {
          const day = isoDate(d)
          const learned = (progress.stars[day] ?? 0) > 0
          const frozen = s.frozen.has(day)
          return (
            <span key={day} className={`streak-day ${day === today ? 'today' : ''} ${learned ? 'learned' : ''}`}>
              <small>{d.toLocaleDateString(locale, { weekday: 'narrow' })}</small>
              <i>{learned ? <Emoji name="fire" size={24} /> : frozen ? <Emoji name="snowflake" size={22} /> : null}</i>
            </span>
          )
        })}
      </div>
      <p className="streak-note">{s.atRisk ? t.streak.atRisk : s.learnedToday ? t.streak.safe : s.longest > 0 ? t.streak.restart(s.longest) : t.streak.start}</p>
    </section>
  )
}
