import { Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sayText, useCanSpeak } from '@/audio/say'
import { useLang, useT } from '@/i18n'
import { countryLines, factsOf, flagUrl, spoken } from './countries'
import { countryName, type Region } from './maps'

/**
 * A tapped country: flag, name, continent, capital, people, size compared with Germany, languages, money, and
 * its neighbours as buttons that jump there. "Hear it" reads the card.
 */
export function CountryCard({ region, regions, onPick }: { region: Region; regions: Region[]; onPick: (r: Region) => void }) {
  const t = useT()
  const lang = useLang()
  const speaks = useCanSpeak(lang)
  // The flag of the country shown (a slow load for an earlier country never shows on this one).
  const [loaded, setLoaded] = useState<{ id: string; url: string | null } | null>(null)
  useEffect(() => {
    let alive = true
    void flagUrl(region.id).then((url) => alive && setLoaded({ id: region.id, url }))
    return () => {
      alive = false
    }
  }, [region.id])
  const flag = loaded?.id === region.id ? loaded.url : null

  const lines = countryLines(region, lang, t)
  const neighbours = (factsOf(region.id)?.borders ?? [])
    .map((iso) => regions.find((r) => r.id === iso))
    .filter((r): r is Region => Boolean(r))
    .sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang))

  return (
    <div className="country">
      <div className="country-head">
        {/* Offline, a flag not seen before cannot load: the card simply has no picture. */}
        {flag && <img className="country-flag" src={flag} alt="" onError={() => setLoaded({ id: region.id, url: null })} />}
        <h2 className="maps-name">{lines[0]}</h2>
      </div>
      {lines.slice(1).map((l) => (
        <p key={l} className="maps-fact">
          {l}
        </p>
      ))}
      {neighbours.length > 0 && (
        <>
          <p className="maps-fact">
            <b>{t.maps.neighbours}</b>
          </p>
          <div className="country-neighbours">
            {neighbours.map((n) => (
              <button key={n.id} className="secondary" onClick={() => onPick(n)}>
                {countryName(n, lang)}
              </button>
            ))}
          </div>
        </>
      )}
      {speaks && (
        <button className="secondary maps-hear" onClick={() => sayText(spoken(lines), lang)}>
          <Volume2 /> {t.maps.hear}
        </button>
      )}
    </div>
  )
}
