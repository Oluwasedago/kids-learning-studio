import { useEffect, useState } from 'react'
import { useT } from '@/i18n'
import { useAutoUpdate } from '@/shared/autoUpdate'
import { Emoji } from '@/shared/Emoji'
import { isDark, useSystemDark } from '@/shared/theme'
import { useIdle } from '@/shared/useIdle'
import { useWakeLock } from '@/shared/wakeLock'
import { Home } from './Home'
import { Shell } from './Shell'
import { type Screen, SCREENS, useStudio } from './studio'
import { StudioData } from './StudioData'

/** A minute without a touch counts as a quiet moment (a new version may load then). */
const QUIET_MS = 60_000

export default function App() {
  return (
    <StudioData>
      <Screens />
    </StudioData>
  )
}

function Screens() {
  const t = useT()
  const { settings } = useStudio()
  // Preview aid: ?screen=learn|games|radio|parents opens that screen.
  const asked = new URLSearchParams(location.search).get('screen')
  const [screen, setScreen] = useState<Screen>(() => SCREENS.find((s) => s === asked) ?? 'home')
  const idle = useIdle(QUIET_MS)
  useAutoUpdate(idle)
  useWakeLock(true)
  const dark = isDark(settings.theme, useSystemDark())
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <Shell screen={screen} title={screen === 'home' ? undefined : t.nav[screen]} onNavigate={setScreen}>
      {screen === 'home' ? (
        <Home />
      ) : (
        <div className="card soon-card">
          <Emoji name="seedling" size={96} />
          <h2>{t.nav[screen]}</h2>
          <p>{t.screens.soon}</p>
        </div>
      )}
    </Shell>
  )
}
