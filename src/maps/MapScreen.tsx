import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { StatusBar } from '@/app/Shell'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import { useLang, useT } from '@/i18n'
import { COUNTRIES } from '@/lessons/data'
import { useArea } from '@/progress/usage'
import { Emoji } from '@/shared/Emoji'
import { CountryCard } from './CountryCard'
import { countryLines, keepFlags, spoken } from './countries'
import worldData from './data/world.json'
import {
  answer,
  boxPoints,
  CONTINENT_COLORS,
  CONTINENTS,
  countryName,
  fitBox,
  nextTarget,
  type Quiz,
  quizCountries,
  quizKind,
  type Region,
  type TapResult,
  tooSmallToTap,
  type ViewBox,
  type Zoom,
  ZOOM_AREAS,
  ZOOMS,
} from './maps'
import './Maps.css'

// The world map (its own chunk, loaded when opened; the service worker keeps it for offline use).

type Props = Record<string, string>
type Bounds = [[number, number], [number, number]]
/** A piece of land on the map: its country, the continent it lies on (French Guiana: France, South America), and
 * its outline, size and middle in SVG units (worked out once). */
type Shape = Feature<Geometry, Props> & { region: Region; continent: string; d: string; bounds: Bounds; centre: [number, number]; area: number }

/** The map's drawing size (SVG units); the SVG scales to its box. */
const W = 1000
const H = 560
const WORLD: ViewBox = { x: 0, y: 0, w: W, h: H }

const PARTS = (() => {
  const topo = worldData as unknown as Topology
  const object = Object.values(topo.objects)[0] as GeometryCollection<Props>
  const fc = feature(topo, object) as FeatureCollection<Geometry, Props>
  return fc.features.flatMap((f) => {
    const p = f.properties
    const region: Region = { id: p.iso, names: { de: p.de, en: p.en, fr: p.fr }, continent: p.cont }
    // France includes French Guiana: drawn, coloured and quizzed as South America (tapping it still shows France).
    if (p.iso === 'FR' && f.geometry.type === 'MultiPolygon')
      return f.geometry.coordinates.map((polygon) => {
        const part: Feature<Geometry, Props> = { type: 'Feature', properties: p, geometry: { type: 'Polygon', coordinates: polygon } }
        return { feature: part, region, continent: geoCentroid(part)[0] < -30 ? 'South America' : p.cont }
      })
    return [{ feature: f, region, continent: p.cont }]
  })
})()
const path = geoPath(geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'FeatureCollection', features: PARTS.map((x) => x.feature) }))
const SHAPES: Shape[] = PARTS.map(({ feature: f, region, continent }) =>
  Object.assign(f, { region, continent, d: path(f) ?? '', bounds: path.bounds(f) as Bounds, centre: path.centroid(f), area: path.area(f) }),
)
/** What each zoom button shows (SVG units). */
const BOXES = Object.fromEntries([
  ['world', WORLD],
  ...Object.entries(ZOOM_AREAS).map(([k, area]) => [k, fitBox(path.bounds({ type: 'MultiPoint', coordinates: boxPoints(area) }), W / H)]),
]) as Record<Zoom, ViewBox>
const REGIONS = [...new Map(SHAPES.map((s) => [s.region.id, s.region])).values()]
/** The zoom that shows a continent best (Natural Earth's continent names are the zoom names). */
const zoomFor = (continent: string): Zoom => (continent in ZOOM_AREAS ? (continent as Zoom) : 'world')

export default function MapScreen({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  useArea('library:worldmap')
  // Flags for offline use, fetched quietly a few seconds after the map opens.
  useEffect(() => {
    const stop = new AbortController()
    const timer = setTimeout(() => void keepFlags(REGIONS.map((r) => r.id), stop.signal), 5000)
    return () => {
      clearTimeout(timer)
      stop.abort()
    }
  }, [])
  return (
    <div className="mission-screen maps-screen">
      <StatusBar
        left={
          <>
            <button className="secondary mission-back" onClick={onClose} aria-label={t.common.back}>
              <ArrowLeft /> <span>{t.common.back}</span>
            </button>
            <h2>
              <Emoji name="globe" size={40} /> {t.items.worldmap}
            </h2>
            <div className="segmented maps-mode">
              {(['explore', 'quiz'] as const).map((m) => (
                <button key={m} className={mode === m ? '' : 'secondary'} onClick={() => setMode(m)}>
                  {t.maps.modes[m]}
                </button>
              ))}
            </div>
          </>
        }
      />
      {mode === 'explore' ? <Explore /> : <QuizView />}
    </div>
  )
}

/** Tap a country: its card (and it is read out when "Read aloud by itself" is on). */
function Explore() {
  const t = useT()
  const lang = useLang()
  const { settings } = useStudio()
  const [selected, setSelected] = useState<Region | null>(null)
  const [zoom, setZoom] = useState<Zoom>('world')
  const pick = (r: Region) => {
    setSelected(r)
    if (settings.readAloud) sayText(spoken(countryLines(r, lang, t)), lang)
  }
  return (
    <div className="maps-body">
      <MapView
        zoom={zoom}
        onZoom={setZoom}
        fill={(s) => (selected?.id === s.region.id ? 'var(--accent)' : CONTINENT_COLORS[s.continent])}
        onTap={(s) => pick(s.region)}
        label={t.items.worldmap}
      />
      <aside className="card maps-side">
        {selected ? (
          <CountryCard region={selected} regions={REGIONS} onPick={pick} />
        ) : (
          <>
            <p className="maps-hint">{t.maps.tapHint}</p>
            <p className="maps-hint">{t.maps.zoomHint}</p>
          </>
        )}
        <p className="maps-source">{t.maps.source}</p>
      </aside>
    </div>
  )
}

/** "Where is …?": continents for younger children, countries later; three tries, then the map shows it. */
function QuizView() {
  const t = useT()
  const lang = useLang()
  const { settings, stage } = useStudio()
  const speaks = useCanSpeak(lang)
  const kind = quizKind(stage)
  // Every lesson country on the map: zoomed in, even the smallest gets a fingertip-sized target.
  const pool = useMemo(
    () =>
      kind === 'continents'
        ? Object.keys(CONTINENTS)
        : quizCountries(
            COUNTRIES.map((c) => c.id.toUpperCase()),
            SHAPES.map((s) => ({ id: s.region.id, area: s.area })),
            0,
          ),
    [kind],
  )
  const [quiz, setQuiz] = useState<Quiz>(() => ({ target: nextTarget(pool, null), misses: 0 }))
  const [feedback, setFeedback] = useState<{ result: TapResult; tapped: string } | null>(null)
  const [score, setScore] = useState(0)
  const [zoom, setZoom] = useState<Zoom>('world')

  const nameOf = (id: string) => (kind === 'continents' ? CONTINENTS[id][lang] : countryName(REGIONS.find((r) => r.id === id)!, lang))
  const question = (id: string) => t.maps.whereIs(nameOf(id))
  const say = (text: string) => settings.readAloud && sayText(text, lang)

  // The first question is read out when the quiz opens.
  useEffect(() => {
    say(question(quiz.target))
    // Once per quiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (s: Shape) => {
    if (feedback?.result === 'right' || feedback?.result === 'shown') return
    const tapped = kind === 'continents' ? s.continent : s.region.id
    const { result, quiz: next } = answer(quiz, tapped)
    setQuiz(next)
    setFeedback({ result, tapped })
    if (result === 'right') {
      setScore((n) => n + 1)
      say(`${t.maps.right} ${nameOf(quiz.target)}.`)
    } else if (result === 'shown') {
      // A small country is shown where it can be seen: zoomed in on its continent.
      const target = SHAPES.find((x) => x.region.id === quiz.target)
      if (kind === 'countries' && target && zoom === 'world') setZoom(zoomFor(target.continent))
      say(t.maps.shown(nameOf(quiz.target)))
    } else say(t.maps.wrong(nameOf(tapped)))
  }

  const nextQuestion = () => {
    const target = nextTarget(pool, quiz.target)
    setQuiz({ target, misses: 0 })
    setFeedback(null)
    say(question(target))
  }

  const fill = (s: Shape) => {
    const id = kind === 'continents' ? s.continent : s.region.id
    if (feedback && feedback.result !== 'wrong' && id === quiz.target) return 'var(--mint)'
    if (feedback?.result === 'wrong' && id === feedback.tapped) return 'var(--red)'
    return CONTINENT_COLORS[s.continent]
  }
  const finished = feedback?.result === 'right' || feedback?.result === 'shown'

  return (
    <div className="maps-body">
      {/* No zoom buttons in the continent quiz: their names would give the answer away. */}
      <MapView zoom={kind === 'countries' ? zoom : 'world'} onZoom={kind === 'countries' ? setZoom : undefined} fill={fill} onTap={tap} label={question(quiz.target)} />
      <aside className="card maps-side">
        <p className="maps-score">
          <Emoji name="star" size={34} /> {score}
          <small>{t.maps.quizKinds[kind]}</small>
        </p>
        <h2 className="maps-question">{question(quiz.target)}</h2>
        {feedback?.result === 'right' && <p className="maps-right">{t.maps.right}</p>}
        {feedback?.result === 'wrong' && <p className="maps-wrong">{t.maps.tryAgain}</p>}
        {feedback?.result === 'shown' && <p className="maps-shown">{t.maps.hereItIs}</p>}
        <div className="maps-buttons">
          {speaks && (
            <button className="secondary" onClick={() => sayText(question(quiz.target), lang)} aria-label={t.mission.hear}>
              <Volume2 />
            </button>
          )}
          {finished && <button onClick={nextQuestion}>{t.maps.next}</button>}
        </div>
        {kind === 'countries' && <p className="maps-hint">{t.maps.zoomHint}</p>}
      </aside>
    </div>
  )
}

/** The size of an element on screen, kept up to date. */
function useSize<T extends Element>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}

interface MapViewProps {
  zoom: Zoom
  /** Missing: no zoom buttons. */
  onZoom?: (z: Zoom) => void
  fill: (s: Shape) => string
  onTap: (s: Shape) => void
  label: string
}

/** The map with its zoom buttons. Zoomed in, a country still smaller than a fingertip gets a round tap target
 * (64 px) and a dot, so even the smallest can be tapped. */
function MapView({ zoom, onZoom, fill, onTap, label }: MapViewProps) {
  const t = useT()
  const lang = useLang()
  const [ref, size] = useSize<SVGSVGElement>()
  const box = BOXES[zoom]
  /** Screen pixels per SVG unit (the SVG keeps its shape: "meet"). */
  const scale = size.w && size.h ? Math.min(size.w / box.w, size.h / box.h) : 0
  const inView = (s: Shape) => s.centre[0] >= box.x && s.centre[0] <= box.x + box.w && s.centre[1] >= box.y && s.centre[1] <= box.y + box.h
  // One target per country (Cyprus is drawn in two parts), the smallest drawn last so it stays reachable.
  const small =
    zoom !== 'world' && scale
      ? [...new Map(SHAPES.filter((s) => inView(s) && tooSmallToTap(s.bounds, scale)).sort((a, b) => a.area - b.area).map((s) => [s.region.id, s])).values()].sort((a, b) => b.area - a.area)
      : []

  return (
    <div className="maps-left">
      {onZoom && (
        <div className="maps-zoom" role="radiogroup">
          {ZOOMS.map((z) => (
            <button key={z} role="radio" aria-checked={z === zoom} className={z === zoom ? '' : 'secondary'} onClick={() => onZoom(z)}>
              {z === 'world' ? t.maps.world : CONTINENTS[z][lang]}
            </button>
          ))}
        </div>
      )}
      <svg ref={ref} className="maps-svg" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" aria-label={label}>
        {SHAPES.map((s, i) => (
          <path key={`${s.region.id}-${i}`} d={s.d} data-id={s.region.id} className="maps-region" style={{ fill: fill(s) }} onClick={() => onTap(s)} />
        ))}
        {small.map((s, i) => (
          <g key={`${s.region.id}-${i}`} className="maps-small" data-id={s.region.id} onClick={() => onTap(s)}>
            <circle cx={s.centre[0]} cy={s.centre[1]} r={32 / scale} className="maps-hit" />
            <circle cx={s.centre[0]} cy={s.centre[1]} r={7 / scale} className="maps-dot" style={{ fill: fill(s) }} />
          </g>
        ))}
      </svg>
    </div>
  )
}
