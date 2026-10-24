import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { countryLines, spoken } from './countries'
import worldData from './data/world.json'
import { answer, CONTINENT_COLORS, CONTINENTS, countryName, nextTarget, type Quiz, quizCountries, quizKind, type Region, type TapResult } from './maps'
import './Maps.css'

// The world map (its own chunk, loaded when opened; the service worker keeps it for offline use).

type Props = Record<string, string>
/** A piece of land on the map: its country, and the continent it lies on (French Guiana: France, South America). */
type Shape = Feature<Geometry, Props> & { region: Region; continent: string }

/** The map's drawing size (SVG units); the SVG scales to its box. */
const W = 1000
const H = 560
/** Countries smaller than this (SVG units²) are too small to tap in the quiz. */
const MIN_QUIZ_AREA = 160

const SHAPES: Shape[] = (() => {
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
        return Object.assign(part, { region, continent: geoCentroid(part)[0] < -30 ? 'South America' : p.cont })
      })
    return [Object.assign(f, { region, continent: p.cont })]
  })
})()
const REGIONS = [...new Map(SHAPES.map((s) => [s.region.id, s.region])).values()]
const path = geoPath(geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'FeatureCollection', features: SHAPES }))

export default function MapScreen({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  useArea('library:worldmap')
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
  const pick = (r: Region) => {
    setSelected(r)
    if (settings.readAloud) sayText(spoken(countryLines(r, lang, t)), lang)
  }
  return (
    <div className="maps-body">
      <MapSvg fill={(s) => (selected?.id === s.region.id ? 'var(--accent)' : CONTINENT_COLORS[s.continent])} onTap={(s) => pick(s.region)} label={t.items.worldmap} />
      <aside className="card maps-side">
        {selected ? <CountryCard region={selected} regions={REGIONS} onPick={pick} /> : <p className="maps-hint">{t.maps.tapHint}</p>}
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
  const pool = useMemo(
    () =>
      kind === 'continents'
        ? Object.keys(CONTINENTS)
        : quizCountries(
            COUNTRIES.map((c) => c.id.toUpperCase()),
            SHAPES.map((s) => ({ id: s.region.id, area: path.area(s) })),
            MIN_QUIZ_AREA,
          ),
    [kind],
  )
  const [quiz, setQuiz] = useState<Quiz>(() => ({ target: nextTarget(pool, null), misses: 0 }))
  const [feedback, setFeedback] = useState<{ result: TapResult; tapped: string } | null>(null)
  const [score, setScore] = useState(0)

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
    } else if (result === 'shown') say(t.maps.shown(nameOf(quiz.target)))
    else say(t.maps.wrong(nameOf(tapped)))
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
      <MapSvg fill={fill} onTap={tap} label={question(quiz.target)} />
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
      </aside>
    </div>
  )
}

function MapSvg({ fill, onTap, label }: { fill: (s: Shape) => string; onTap: (s: Shape) => void; label: string }) {
  return (
    <svg className="maps-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {SHAPES.map((s, i) => (
        <path key={`${s.region.id}-${i}`} d={path(s) ?? ''} data-id={s.region.id} className="maps-region" style={{ fill: fill(s) }} onClick={() => onTap(s)} />
      ))}
    </svg>
  )
}
