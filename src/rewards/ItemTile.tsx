import { type CSSProperties, type ReactNode, useState } from 'react'
import { changeAccess } from '@/access/access'
import { ITEMS, type ItemId } from '@/access/catalogue'
import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { ParentGate } from '@/parent/ParentGate'
import { Emoji } from '@/shared/Emoji'
import { useLongPress } from '@/shared/useLongPress'
import './Rewards.css'

interface Props {
  id: ItemId
  /** Opens the item (only called when it is open). */
  onOpen: () => void
  /** A tap on a locked tile (e.g. light up the missions card). */
  onLocked?: () => void
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

/**
 * A tile for any item, following access control: hidden items are not drawn; locked ones show a padlock (a tap
 * points to the missions, holding it for 2 seconds asks for the parent PIN and unlocks it for today); open ones
 * open. Earned ones show a small clock: their minutes count against today's earned time.
 */
export function ItemTile({ id, onOpen, onLocked, style, className = '', children }: Props) {
  const t = useT()
  const { accessOf, today, updateSettings } = useStudio()
  const [askPin, setAskPin] = useState(false)
  const state = accessOf(id)
  const press = useLongPress(() => onLocked?.(), () => setAskPin(true))
  if (state === 'hidden') return null
  const locked = state === 'locked'
  const inner = (
    <>
      <Emoji name={locked ? 'locked' : ITEMS[id].emoji} size={64} />
      <b>{t.items[id]}</b>
      {children}
      {locked && <small>{t.access.missionsFirst}</small>}
      {state === 'earned' && (
        <small className="tile-earned">
          <Emoji name="clock" size={20} /> {t.access.earnedTime}
        </small>
      )}
    </>
  )
  return (
    <>
      {locked ? (
        <button className={`play-tile muted ${className}`} style={style} {...press}>
          {inner}
        </button>
      ) : (
        <button className={`play-tile ${className}`} style={style} onClick={onOpen}>
          {inner}
        </button>
      )}
      {askPin && (
        <ParentGate
          note={t.access.unlockTodayNote(t.items[id])}
          onOpen={() => {
            setAskPin(false)
            updateSettings((s) => ({ ...s, access: { ...s.access, [id]: changeAccess(s.access[id], 'unlockToday', today) } }))
          }}
          onClose={() => setAskPin(false)}
        />
      )}
    </>
  )
}
