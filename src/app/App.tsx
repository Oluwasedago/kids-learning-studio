import { useEffect, useRef, useState } from 'react'
import { ITEMS, type ItemId } from '@/access/catalogue'
import { backupDue } from '@/data/backup'
import { GamesScreen } from '@/games/GamesScreen'
import { LearnScreen } from '@/games/LearnScreen'
import { deviceLang, LangContext, useT } from '@/i18n'
import { MediaScreen } from '@/media/MediaScreen'
import { usePlayer } from '@/media/player'
import { PlayerProvider } from '@/media/PlayerProvider'
import { ParentGate } from '@/parent/ParentGate'
import { ParentScreen } from '@/parent/ParentScreen'
import { addUsage, currentArea, TICK_SECONDS } from '@/progress/usage'
import { DEMO_PIN, startDemo } from '@/setup/demo'
import { SetupWizard } from '@/setup/SetupWizard'
import { setVoicePreference } from '@/audio/say'
import { useAutoUpdate } from '@/shared/autoUpdate'
import { Emoji } from '@/shared/Emoji'
import { isDark, useSystemDark } from '@/shared/theme'
import { useIdle } from '@/shared/useIdle'
import { useWakeLock } from '@/shared/wakeLock'
import { Home } from './Home'
import { Shell } from './Shell'
import { type Screen, SCREENS, useStudio } from './studio'
import { StudioData } from './StudioData'

/** Two minutes without a touch: idle (time stops counting; a new version may load). */
const IDLE_MS = 2 * 60_000

export default function App() {
  return (
    <StudioData>
      <Root />
    </StudioData>
  )
}

function Root() {
  const { ready, settings } = useStudio()
  setVoicePreference(settings.voice)
  const dark = isDark(settings.theme, useSystemDark())
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  const lang = settings.lang ?? deviceLang()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  // A "Try the demo" link (…/?demo) on a device that is not set up yet opens the demo straight away.
  const wantsDemo = ready && !settings.setupDone && new URLSearchParams(location.search).has('demo')
  useEffect(() => {
    if (wantsDemo) void startDemo()
  }, [wantsDemo])
  if (!ready || wantsDemo) return null
  return (
    <LangContext.Provider value={lang}>
      {settings.setupDone ? (
        <PlayerProvider>
          <Screens />
        </PlayerProvider>
      ) : (
        <SetupWizard />
      )}
    </LangContext.Provider>
  )
}

function Screens() {
  const t = useT()
  const { settings, now } = useStudio()
  // Preview aid: ?screen=learn|games|media opens that screen.
  const asked = new URLSearchParams(location.search).get('screen')
  const [screen, setScreen] = useState<Screen>(() => SCREENS.find((s) => s === asked && s !== 'parents') ?? 'home')
  const [askPin, setAskPin] = useState(false)
  const [startGame, setStartGame] = useState<ItemId | null>(null)
  const [startListen, setStartListen] = useState<ItemId | null>(null)
  const idle = useIdle(IDLE_MS)
  const player = usePlayer()
  // A story or the radio plays without a touch: a new version waits until it stops.
  useAutoUpdate(idle && player.state !== 'playing' && player.state !== 'loading')
  useWakeLock(true)
  useUsageClock(screen, idle)

  const navigate = (s: Screen) => {
    if (s === 'parents' && screen !== 'parents') setAskPin(true)
    else setScreen(s)
  }

  return (
    <>
      {settings.demo && (
        <div className="demo-banner" role="note">
          <Emoji name="sparkles" size={24} /> <span className="wide-only">{t.demo.banner(DEMO_PIN)}</span>
          <span className="narrow-only">{t.demo.bannerShort(DEMO_PIN)}</span>
        </div>
      )}
      <Shell screen={screen} title={screen === 'home' ? undefined : t.nav[screen]} onNavigate={navigate} parentsDot={backupDue(settings, now)}>
        {screen === 'home' && (
          <Home
            onPlay={(id) => {
              if (ITEMS[id].group === 'games') {
                setStartGame(id)
                setScreen('games')
              } else {
                setStartListen(id)
                setScreen('media')
              }
            }}
          />
        )}
        {screen === 'learn' && <LearnScreen />}
        {screen === 'games' && <GamesScreen start={startGame} onStarted={() => setStartGame(null)} />}
        {screen === 'media' && <MediaScreen key={startListen ?? ''} start={startListen} />}
        {screen === 'parents' && <ParentScreen />}
      </Shell>
      {askPin && (
        <ParentGate
          onOpen={() => {
            setAskPin(false)
            setScreen('parents')
          }}
          onClose={() => setAskPin(false)}
        />
      )}
    </>
  )
}

/**
 * Every 15 seconds while the app is visible and in use, 15 seconds go to the area that is open (a mission, a
 * game, or the screen). Earned games also count against today's earned time.
 */
function useUsageClock(screen: Screen, idle: boolean) {
  const { updateUsage } = useStudio()
  const live = useRef({ screen, idle })
  useEffect(() => {
    live.current = { screen, idle }
  }, [screen, idle])
  useEffect(() => {
    const timer = setInterval(() => {
      const { screen: s, idle: i } = live.current
      if (document.hidden || i || s === 'parents') return
      const { area, earned } = currentArea(s)
      updateUsage((u) => addUsage(u, new Date(), area, TICK_SECONDS, earned))
    }, TICK_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [updateUsage])
}
