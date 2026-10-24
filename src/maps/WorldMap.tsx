import { ArrowLeft } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { StatusBar } from '@/app/Shell'
import { useT } from '@/i18n'

// The world map is its own chunk (map data, d3-geo, topojson): downloaded the first time it is opened, then
// kept by the service worker for offline use. The rest of the app does not get heavier.
const MapScreen = lazy(() => import('./MapScreen').catch(() => ({ default: NotYetOffline })))

export function WorldMap({ onClose }: { onClose: () => void }) {
  return (
    <Suspense fallback={<div className="mission-screen" />}>
      <MapScreen onClose={onClose} />
    </Suspense>
  )
}

/** Opened for the first time without a connection: the map has not been downloaded yet. */
function NotYetOffline({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <div className="mission-screen">
      <StatusBar
        left={
          <button className="secondary mission-back" onClick={onClose} aria-label={t.common.back}>
            <ArrowLeft /> <span>{t.common.back}</span>
          </button>
        }
      />
      <p className="card maps-hint">{t.maps.needsOnline}</p>
    </div>
  )
}
