import type { ReactNode } from 'react'
import { type ItemGroup, ITEMS, itemsIn } from '@/access/catalogue'
import { LOCALES, useLang, useT } from '@/i18n'
import { Emoji } from '@/shared/Emoji'
import { useBattery } from '@/shared/useBattery'
import { clock } from '@/shared/clock'
import { useOnline } from '@/shared/useOnline'
import { type Screen, useStudio } from './studio'
import './Shell.css'

/** The menu. An entry shows when at least one of its items is switched on and ready (access layer 1). */
const NAV: { id: Exclude<Screen, 'parents'>; emoji: string; group?: ItemGroup }[] = [
  { id: 'home', emoji: 'house' },
  { id: 'learn', emoji: 'gradcap', group: 'learning' },
  { id: 'games', emoji: 'joystick', group: 'games' },
  { id: 'media', emoji: 'media', group: 'media' },
]

interface Props {
  screen: Screen
  title?: string
  onNavigate: (s: Screen) => void
  /** Show a dot on Parents (e.g. a backup is due). */
  parentsDot?: boolean
  children: ReactNode
}

/** Every screen: the menu on the left (bottom on phones), the status bar on top. */
export function Shell({ screen, title, onNavigate, parentsDot, children }: Props) {
  const t = useT()
  const { accessOf, settings } = useStudio()
  const shown = NAV.filter((n) => !n.group || itemsIn(n.group).some((id) => ITEMS[id].ready && accessOf(id) !== 'hidden'))
  return (
    <div className={`shell ${settings.demo ? 'with-banner' : ''}`}>
      <nav className="sidebar">
        {shown.map((item) => (
          <button key={item.id} className={`nav-item ${screen === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <Emoji name={item.emoji} size={46} />
            <span>{t.nav[item.id]}</span>
          </button>
        ))}
        <button className={`nav-item nav-parent ${screen === 'parents' ? 'active' : ''}`} onClick={() => onNavigate('parents')}>
          <Emoji name="gear" size={34} />
          <span>{t.nav.parents}</span>
          {parentsDot && <i className="nav-dot" aria-label={t.backup.due} />}
        </button>
      </nav>
      <div className="shell-main">
        <StatusBar title={title} />
        <div className="shell-content">{children}</div>
      </div>
    </div>
  )
}

/**
 * Online state, earned time, clock and battery on the right; on the left the screen's title (or today's date),
 * or `left` (e.g. a back button and a mission's name in full-screen views).
 */
export function StatusBar({ title, left }: { title?: string; left?: ReactNode }) {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { now, earnedLeft } = useStudio()
  const battery = useBattery()
  const online = useOnline()
  return (
    <header className="statusbar">
      {left ? (
        <div className="statusbar-left">{left}</div>
      ) : (
        <h1 className="statusbar-title">
          {title ?? (
            <>
              <span className="wide-only">{now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span className="narrow-only">{now.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </>
          )}
        </h1>
      )}
      <div className="statusbar-right">
        {!online && <span className="status-chip offline">{t.status.offline}</span>}
        {earnedLeft > 0 && (
          <span className="status-chip earned" aria-label={t.status.earnedLeft(Math.ceil(earnedLeft / 60))}>
            <Emoji name="clock" size={26} />
            {clock(earnedLeft)}
          </span>
        )}
        <span className="status-chip status-clock">{now.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</span>
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
