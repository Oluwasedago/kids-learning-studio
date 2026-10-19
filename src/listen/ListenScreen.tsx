import { ArrowLeft, Pause, Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isOpen } from '@/access/access'
import type { ItemId } from '@/access/catalogue'
import { StatusBar } from '@/app/Shell'
import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { useArea } from '@/progress/usage'
import { ItemTile } from '@/rewards/ItemTile'
import { clock } from '@/shared/clock'
import { Emoji } from '@/shared/Emoji'
import { usePlayer } from './player'
import { COLLECTIONS, type Collection, embedUrl, STATIONS, thumbnail } from './sources'
import '@/games/Games.css'
import './Listen.css'

type Tab = 'radio' | 'stories' | 'videos'
const TABS: { id: Tab; emoji: string }[] = [
  { id: 'radio', emoji: 'radio' },
  { id: 'stories', emoji: 'openbook' },
  { id: 'videos', emoji: 'tv' },
]

/** Listen & watch: radio, stories and the parents' videos, each only when switched on (and open or earned). */
export function ListenScreen({ start }: { start?: ItemId | null }) {
  const t = useT()
  const { accessOf } = useStudio()
  const tabs = TABS.filter((x) => accessOf(x.id) !== 'hidden')
  const [tab, setTab] = useState<Tab>(() => tabs.find((x) => x.id === start)?.id ?? tabs[0]?.id ?? 'radio')
  if (tabs.length === 0) return null
  return (
    <div className="listen">
      <div className="shelf-tabs" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === tab} className={x.id === tab ? '' : 'secondary'} onClick={() => setTab(x.id)}>
            <Emoji name={x.emoji} size={32} /> {t.items[x.id]}
          </button>
        ))}
        <NowPlaying />
      </div>
      {isOpen(accessOf(tab)) ? (
        tab === 'radio' ? <RadioTab /> : tab === 'stories' ? <StoriesTab /> : <VideosTab />
      ) : (
        <div className="listen-locked">
          <ItemTile id={tab} onOpen={() => {}} />
        </div>
      )}
    </div>
  )
}

/** What is playing, with pause and stop, on every tab. */
function NowPlaying() {
  const t = useT()
  const p = usePlayer()
  if (!p.playing) return null
  return (
    <span className="now-playing pill">
      {p.state === 'loading' ? t.listen.loading : p.state === 'error' ? t.listen.error : p.playing.title}
      <button className="secondary" onClick={p.toggle} aria-label={p.state === 'playing' ? t.listen.pause : t.listen.play}>
        {p.state === 'playing' ? <Pause /> : <Play />}
      </button>
      <button className="secondary" onClick={p.stop} aria-label={t.listen.stop}>
        <Square />
      </button>
    </span>
  )
}

function RadioTab() {
  const t = useT()
  const { settings } = useStudio()
  const p = usePlayer()
  const stations = [...STATIONS, ...settings.stations.map((s) => ({ ...s, about: t.listen.addedByParent, emoji: 'radio', builtIn: false }))]
  return (
    <div className="listen-grid">
      {stations.map((s) => {
        const on = p.playing?.id === s.id
        return (
          <button key={s.id} className={`card station ${on ? 'on' : ''}`} onClick={() => (on ? p.stop() : p.play({ item: 'radio', id: s.id, title: s.name, url: s.url, live: true }))}>
            <Emoji name={s.emoji} size={72} />
            <span>
              <h3>{s.name}</h3>
              <small>{s.about}</small>
            </span>
            <span className="station-go">{on ? <Square fill="currentColor" /> : <Play fill="currentColor" />}</span>
            {on && p.state === 'playing' && <span className="pill live">● {t.listen.live}</span>}
          </button>
        )
      })}
      <p className="muted listen-note">{t.listen.radioNote}</p>
    </div>
  )
}

function StoriesTab() {
  const t = useT()
  const [open, setOpen] = useState<Collection | null>(null)
  if (open) return <CollectionView collection={open} onBack={() => setOpen(null)} />
  return (
    <div className="listen-grid">
      {COLLECTIONS.map((c) => (
        <button key={c.id} className="card station" onClick={() => setOpen(c)}>
          <Emoji name={c.emoji} size={72} />
          <span>
            <h3>{c.title}</h3>
            <small>
              {c.author} · {t.listen.stories(c.tracks.length)}
            </small>
          </span>
        </button>
      ))}
      <p className="muted listen-note">{t.listen.storiesNote}</p>
    </div>
  )
}

function CollectionView({ collection, onBack }: { collection: Collection; onBack: () => void }) {
  const t = useT()
  const p = usePlayer()
  return (
    <div className="card story-list">
      <h3 className="card-title">
        <button className="secondary" onClick={onBack} aria-label={t.common.back}>
          <ArrowLeft />
        </button>
        <Emoji name={collection.emoji} size={40} /> {collection.title}
      </h3>
      <ol>
        {collection.tracks.map((tr) => {
          const on = p.playing?.id === tr.id
          return (
            <li key={tr.id} className={on ? 'on' : ''}>
              <button className={on ? '' : 'secondary'} onClick={() => (on ? p.toggle() : p.play({ item: 'stories', id: tr.id, title: tr.title, url: tr.url, live: false }))}>
                {on && p.state === 'playing' ? <Pause /> : <Play />}
              </button>
              <span>
                <b>{tr.title}</b>
                <small className="muted">{on && p.duration ? `${clock(p.time)} / ${clock(p.duration)}` : clock(tr.length)}</small>
              </span>
            </li>
          )
        })}
      </ol>
      <small className="muted">
        {t.listen.credit(collection.author)}{' '}
        <a href={collection.source} target="_blank" rel="noreferrer">
          archive.org
        </a>
      </small>
    </div>
  )
}

function VideosTab() {
  const t = useT()
  const { settings, accessOf } = useStudio()
  const p = usePlayer()
  const [playing, setPlaying] = useState<(typeof settings.videos)[number] | null>(null)
  if (settings.videos.length === 0) return <p className="card muted">{t.listen.noVideos}</p>
  return (
    <div className="listen-grid">
      {settings.videos.map((v) => {
        const thumb = thumbnail(v)
        return (
          <button
            key={v.id}
            className="card video-card"
            onClick={() => {
              p.stop()
              setPlaying(v)
            }}
          >
            {thumb ? <img src={thumb} alt="" loading="lazy" /> : <Emoji name="tv" size={72} />}
            <b>{v.title}</b>
          </button>
        )
      })}
      {playing && <VideoPlayer video={playing} earned={accessOf('videos') === 'earned'} onClose={() => setPlaying(null)} />}
    </div>
  )
}

function VideoPlayer({ video, earned, onClose }: { video: { kind: 'video' | 'playlist'; id: string; title: string }; earned: boolean; onClose: () => void }) {
  const t = useT()
  const { earnedLeft, accessOf } = useStudio()
  const open = isOpen(accessOf('videos'))
  useArea('watch:videos', earned)
  // Earned time used up (or videos switched off) while watching: the player closes.
  useEffect(() => {
    if (!open) onClose()
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="game-frame">
      <StatusBar
        left={
          <>
            <button onClick={onClose}>
              <ArrowLeft /> {t.common.back}
            </button>
            <h2>{video.title}</h2>
            {earned && <span className="pill">{clock(earnedLeft)}</span>}
          </>
        }
      />
      {/* No popups and no navigating away from the app. */}
      <iframe className="video-frame" src={embedUrl(video)} title={video.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
    </div>
  )
}
