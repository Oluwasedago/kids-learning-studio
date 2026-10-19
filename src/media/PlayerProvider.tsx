import { type ReactNode, useEffect, useRef, useState } from 'react'
import { isOpen } from '@/access/access'
import { useStudio } from '@/app/studio'
import { useArea } from '@/progress/usage'
import { type Player, PlayerContext, type Playing } from './player'

/** Keeps the one <audio> element; see player.ts. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const { accessOf } = useStudio()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<Playing | null>(null)
  const [state, setState] = useState<Player['state']>('stopped')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const el = () => {
    if (!audio.current) {
      const a = new Audio()
      a.preload = 'none'
      a.addEventListener('playing', () => setState('playing'))
      a.addEventListener('pause', () => setState((s) => (s === 'stopped' ? s : 'paused')))
      a.addEventListener('waiting', () => setState('loading'))
      a.addEventListener('error', () => setState('error'))
      a.addEventListener('ended', () => setState('stopped'))
      a.addEventListener('timeupdate', () => setTime(a.currentTime))
      a.addEventListener('durationchange', () => setDuration(Number.isFinite(a.duration) ? a.duration : 0))
      audio.current = a
    }
    return audio.current
  }

  const stop = () => {
    const a = audio.current
    setState('stopped')
    setPlaying(null)
    if (a) {
      a.pause()
      a.removeAttribute('src')
      a.load()
    }
  }

  // A locked item whose earned time runs out (or that a parent switches off) stops playing: the sound is
  // paused here, and the player reports "stopped" while it is not allowed.
  const allowed = playing ? isOpen(accessOf(playing.item)) : true
  useEffect(() => {
    if (!allowed) audio.current?.pause()
  }, [allowed])
  // Time spent listening counts as that item (and as earned time when it was opened with earned time).
  useArea(allowed && playing && state !== 'paused' ? `listen:${playing.item}` : null, playing ? accessOf(playing.item) === 'earned' : false)

  const player: Player = {
    playing: allowed ? playing : null,
    state: allowed ? state : 'stopped',
    time,
    duration,
    play: (p) => {
      const a = el()
      setPlaying(p)
      setTime(0)
      setDuration(0)
      setState('loading')
      a.src = p.url
      a.play().catch(() => setState('error'))
    },
    toggle: () => {
      const a = audio.current
      if (!a || !playing) return
      if (a.paused) {
        setState('loading')
        // Live radio starts again at "now" rather than where it was paused.
        if (playing.live) a.src = playing.url
        a.play().catch(() => setState('error'))
      } else a.pause()
    },
    stop,
  }
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
}
