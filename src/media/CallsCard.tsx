import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { ItemTile } from '@/rewards/ItemTile'
import { Emoji } from '@/shared/Emoji'
import { callLinkOk } from './sources'

/**
 * One-tap calls to family: each contact a parent added opens their call link (phone, WhatsApp, FaceTime…) in the
 * device's own app. Whether a tablet can place the call depends on that app being installed (to verify per device).
 */
export function CallsCard() {
  const t = useT()
  const { accessOf, settings } = useStudio()
  const state = accessOf('calls')
  const contacts = settings.contacts.filter((c) => callLinkOk(c.link))
  if (state === 'hidden' || contacts.length === 0) return null
  if (state === 'locked') return <ItemTile id="calls" onOpen={() => {}} />
  return (
    <section className="card calls-card">
      <h3 className="card-title">
        <Emoji name="speech" size={36} /> {t.items.calls}
      </h3>
      <div className="calls">
        {contacts.map((c) => (
          <a key={c.id} className="button secondary" href={c.link}>
            <Emoji name="heart" size={26} /> {c.name}
          </a>
        ))}
      </div>
    </section>
  )
}
