import { ArrowRight, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useStudio } from '@/app/studio'
import { sayText, useCanSpeak } from '@/audio/say'
import { useT } from '@/i18n'
import { factOrder } from '@/lessons/facts'
import { Emoji } from '@/shared/Emoji'
import './DidYouKnow.css'

/**
 * "Did you know?": a slim strip along the bottom of the home screen with one random fact; the arrow shows the
 * next one (a fresh random order once all have been seen). It stays in place; the page above it scrolls.
 */
export function DidYouKnow() {
  const t = useT()
  const { accessOf } = useStudio()
  const speaks = useCanSpeak()
  const [order, setOrder] = useState(() => factOrder())
  const [i, setI] = useState(0)
  if (accessOf('facts') === 'hidden') return null
  const fact = order[i]
  const next = () => {
    if (i + 1 < order.length) return setI(i + 1)
    let fresh = factOrder()
    if (fresh[0] === fact) fresh = [...fresh.slice(1), fresh[0]]
    setOrder(fresh)
    setI(0)
  }
  return (
    <section className="dyk-strip" aria-label={t.items.facts}>
      <Emoji name={fact.emoji} size={40} />
      <div className="dyk-text">
        <small>
          {t.items.facts} · {t.facts.topics[fact.topic]}
        </small>
        <p>{fact.text}</p>
      </div>
      {speaks && (
        <button className="secondary" onClick={() => sayText(fact.text)} aria-label={t.mission.hear}>
          <Volume2 />
        </button>
      )}
      <button className="secondary" onClick={next} aria-label={t.facts.another}>
        <ArrowRight />
      </button>
    </section>
  )
}
