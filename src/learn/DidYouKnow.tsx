import { ArrowRight, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import { useT } from '@/i18n'
import { factOrder } from '@/lessons/facts'
import { Emoji } from '@/shared/Emoji'
import './DidYouKnow.css'

/** "Did you know?": one random fact at a time; "Another one" shows the next in a fresh random order. */
export function DidYouKnow({ compact = false }: { compact?: boolean }) {
  const t = useT()
  const { accessOf } = useStudio()
  const speaks = useCanSpeak()
  const [order, setOrder] = useState(() => factOrder())
  const [i, setI] = useState(0)
  if (accessOf('facts') === 'hidden') return null
  const fact = order[i]
  const next = () => {
    if (i + 1 < order.length) return setI(i + 1)
    // All seen: a new order that does not start with the fact just shown.
    let fresh = factOrder()
    if (fresh[0] === fact) fresh = [...fresh.slice(1), fresh[0]]
    setOrder(fresh)
    setI(0)
  }
  return (
    <section className={`card did-you-know ${compact ? 'compact' : ''}`}>
      <h3 className="card-title">
        <Emoji name="light" size={36} /> {t.items.facts}
        <span className="pill">{t.facts.topics[fact.topic]}</span>
      </h3>
      <div className="dyk-body">
        <Emoji name={fact.emoji} size={compact ? 56 : 96} />
        <p>{fact.text}</p>
      </div>
      <div className="dyk-actions">
        {speaks && (
          <button className="secondary" onClick={() => sayText(fact.text)} aria-label={t.mission.hear}>
            <Volume2 />
          </button>
        )}
        <button className="secondary" onClick={next}>
          {t.facts.another} <ArrowRight />
        </button>
      </div>
    </section>
  )
}
