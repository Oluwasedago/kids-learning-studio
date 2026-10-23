import { ArrowLeft, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { StatusBar } from '@/app/Shell'
import { sayText, useCanSpeak } from '@/audio/say'
import { type Lang, useLang, useT } from '@/i18n'
import { ANIMALS } from '@/lessons/data'
import { lessonText } from '@/lessons/text'
import { useArea } from '@/progress/usage'
import { Emoji } from '@/shared/Emoji'
import { ANIMAL_HOMES, animalPhoto } from './animals'
import CREDITS from './photo-credits.json'
import { PLACE_COUNTRIES, PLACES, placeCountry, placePhoto } from './places'
import './Library.css'

// The library: animals and places of the world, each with a real photo, a few true sentences that can be
// read aloud, and the photo's credit (Wikimedia Commons, free licences).

export type Shelf = 'animals' | 'places'

interface Entry {
  id: string
  photo: string
  name: string
  /** Under the name in the grid (the country of a place). */
  sub?: string
  lines: { label?: string; text: string }[]
}

const credits = CREDITS as Record<string, { author: string; licence: string }>

function entries(shelf: Shelf, lang: Lang, country: string | null, t: ReturnType<typeof useT>): Entry[] {
  if (shelf === 'animals') {
    const T = lessonText(lang)
    return ANIMALS.map((a) => ({
      id: a.id,
      photo: animalPhoto(a.id),
      name: T.animals[a.id].name,
      lines: [{ text: T.animals[a.id].fact }, { label: t.library.lives, text: ANIMAL_HOMES[a.id][lang] }],
    })).sort((a, b) => a.name.localeCompare(b.name, lang))
  }
  return PLACES.filter((p) => !country || p.countries.includes(country))
    .map((p) => ({ id: p.id, photo: placePhoto(p.id), name: p.text[lang].name, sub: placeCountry(p, lang), lines: [{ label: t.library.country, text: placeCountry(p, lang) }, { text: p.text[lang].about }] }))
    .sort((a, b) => a.name.localeCompare(b.name, lang))
}

export function LibraryScreen({ shelf, onClose }: { shelf: Shelf; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const [country, setCountry] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  useArea(`library:${shelf}`)
  const list = entries(shelf, lang, country, t)
  const countries = Object.keys(PLACE_COUNTRIES)
    .filter((c) => PLACES.some((p) => p.countries.includes(c)))
    .sort((a, b) => PLACE_COUNTRIES[a][lang].localeCompare(PLACE_COUNTRIES[b][lang], lang))
  const title = shelf === 'animals' ? t.items.animals : t.items.places

  return (
    <div className="mission-screen library-screen">
      <StatusBar
        left={
          <>
            <button className="secondary mission-back" onClick={open === null ? onClose : () => setOpen(null)} aria-label={t.common.back}>
              <ArrowLeft /> <span>{t.common.back}</span>
            </button>
            <h2>
              <Emoji name={shelf === 'animals' ? 'paws' : 'map'} size={40} /> {title}
            </h2>
          </>
        }
      />
      {open !== null && list[open] ? (
        <Detail entry={list[open]} onPrev={() => setOpen((open + list.length - 1) % list.length)} onNext={() => setOpen((open + 1) % list.length)} />
      ) : (
        <div className="library-body">
          {shelf === 'places' && (
            <div className="library-filter" role="radiogroup" aria-label={t.library.country}>
              <button role="radio" aria-checked={country === null} className={country === null ? '' : 'secondary'} onClick={() => setCountry(null)}>
                {t.library.allCountries}
              </button>
              {countries.map((c) => (
                <button key={c} role="radio" aria-checked={country === c} className={country === c ? '' : 'secondary'} onClick={() => setCountry(c)}>
                  {PLACE_COUNTRIES[c][lang]}
                </button>
              ))}
            </div>
          )}
          <div className="library-grid">
            {list.map((e, i) => (
              <button key={e.id} className="card library-card" onClick={() => setOpen(i)}>
                <img src={`${import.meta.env.BASE_URL}${e.photo}`} alt="" loading="lazy" />
                <b>{e.name}</b>
                {e.sub && <small>{e.sub}</small>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ entry, onPrev, onNext }: { entry: Entry; onPrev: () => void; onNext: () => void }) {
  const t = useT()
  const lang = useLang()
  const speaks = useCanSpeak(lang)
  const credit = credits[entry.id]
  const spoken = [entry.name, ...entry.lines.map((l) => (l.label ? `${l.label}: ${l.text}` : l.text))].join('. ')
  return (
    <section className="card library-detail">
      <figure>
        <img src={`${import.meta.env.BASE_URL}${entry.photo}`} alt={entry.name} />
        {credit && <figcaption>{t.library.photo(credit.author, credit.licence)}</figcaption>}
      </figure>
      <div className="library-text">
        <h2>
          {entry.name}
          {speaks && (
            <button className="secondary" onClick={() => sayText(spoken, lang)} aria-label={t.mission.hear}>
              <Volume2 />
            </button>
          )}
        </h2>
        {entry.lines.map((l, i) => (
          <p key={i}>
            {l.label && <b>{l.label}: </b>}
            {l.text}
          </p>
        ))}
        <div className="library-nav">
          <button className="secondary" onClick={onPrev} aria-label={t.library.previous}>
            <ChevronLeft />
          </button>
          <button className="secondary" onClick={onNext} aria-label={t.library.next}>
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  )
}
