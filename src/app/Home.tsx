import { usePersistence } from '@/data/persist'
import { useT } from '@/i18n'
import { dayPart } from '@/shared/dayPart'
import { Emoji } from '@/shared/Emoji'
import { useStudio } from './studio'
import './Home.css'

/** The home screen. Step 1: greeting, what is coming, storage status and the credits. */
export function Home() {
  const t = useT()
  const { now, settings } = useStudio()
  return (
    <div className="home">
      <section className="hero card">
        <Emoji name="sparkles" size={96} />
        <div>
          <h2>{t.home.greeting(dayPart(now), settings.childName)}</h2>
          <p className="muted">{t.about.privacy}</p>
        </div>
      </section>
      <section className="card">
        <h3 className="card-title">
          <Emoji name="seedling" size={40} />
          {t.home.preview}
        </h3>
        <p>{t.home.previewText}</p>
      </section>
      <StorageCard />
      <section className="card about">
        <p>
          <b>{t.appName}</b> · {t.developedBy}
        </p>
        <p className="muted">{t.about.licence}</p>
      </section>
    </div>
  )
}

function StorageCard() {
  const t = useT()
  const { state, usedMb } = usePersistence()
  const text = state === 'persisted' ? t.storage.persisted : state === 'not-persisted' ? t.storage.notPersisted : state === 'unsupported' ? t.storage.unknown : '…'
  return (
    <section className="card">
      <h3 className="card-title">
        <Emoji name={state === 'persisted' ? 'locked' : 'warning'} size={40} />
        {t.storage.title}
      </h3>
      <p>{text}</p>
      {usedMb && <p className="muted">{t.storage.used(usedMb)}</p>}
    </section>
  )
}
