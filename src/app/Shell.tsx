import type { ReactNode } from 'react'
import { LOCALES, useLang, useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import { useBattery } from '@/shared/useBattery'
import { useOnline } from '@/shared/useOnline'
import { type Screen, useStudio } from './studio'
import './Shell.css'

/** The menu. Parents sits apart at the bottom (Step 2 puts it behind the parent password). */
const NAV: { id: Exclude<Screen, 'parents'>; emoji: string }[] = [
  { id: 'home', emoji: 'house' },
  { id: 'learn', emoji: 'gradcap' },
  { id: 'games', emoji: 'joystick' },
  { id: 'radio', emoji: 'radio' },
]

interface Props {
  screen: Screen
  title?: string
  onNavigate: (s: Screen) => void
  children: ReactNode
}

/** Every screen: the menu on the left, the status bar (date or title, online, time, battery) on top. */
export function Shell({ screen, title, onNavigate, children }: Props) {
  const t = useT()
  return (
    <div className="shell">
      <nav className="sidebar">
        {NAV.map((item) => (
          <button key={item.id} className={`nav-item ${screen === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <Emoji name={item.emoji} size={46} />
            <span>{t.nav[item.id]}</span>
          </button>
        ))}
        <button className={`nav-item nav-parent ${screen === 'parents' ? 'active' : ''}`} onClick={() => onNavigate('parents')}>
          <Emoji name="gear" size={34} />
          <span>{t.nav.parents}</span>
        </button>
      </nav>
      <div className="shell-main">
        <StatusBar title={title} />
        <div className="shell-content">{children}</div>
      </div>
    </div>
  )
}

/** Online state, time and battery on the right; on the left the screen's title, or today's date. */
export function StatusBar({ title }: { title?: string }) {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { now } = useStudio()
  const battery = useBattery()
  const online = useOnline()
  return (
    <header className="statusbar">
      <h1 className="statusbar-title">{title ?? now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
      <div className="statusbar-right">
        {!online && <span className="status-chip offline">{t.status.offline}</span>}
        <span className="status-chip status-clock">{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
        {battery && (
          <span className={`status-chip battery ${battery.level <= 20 && !battery.charging ? 'low' : ''}`} aria-label={t.status.battery(battery.level)}>
            <span className="battery-shape" aria-hidden>
              <span style={{ width: `${battery.level}%` }} />
            </span>
            {battery.level}%{battery.charging && <Emoji name="plug" size={22} label={t.status.charging} />}
          </span>
        )}
      </div>
    </header>
  )
}
