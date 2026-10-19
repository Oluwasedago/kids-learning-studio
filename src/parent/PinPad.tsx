import { Delete, X } from 'lucide-react'
import { useState } from 'react'
import { useT } from '@/i18n'
import { PIN_LENGTH } from './pin'
import './Parent.css'

interface Props {
  title: string
  error?: string
  /** Shown under the title (e.g. what the PIN will unlock). */
  note?: string
  onPin: (pin: string) => void
  onClose?: () => void
}

/** Big number pad for the parent PIN. Digits are never shown, only dots. */
export function PinPad({ title, error, note, onPin, onClose }: Props) {
  const t = useT()
  const [pin, setPin] = useState('')
  const press = (digit: string) => {
    const next = (pin + digit).slice(0, PIN_LENGTH)
    setPin(next)
    if (next.length === PIN_LENGTH) {
      onPin(next)
      setPin('')
    }
  }
  return (
    <div className="pin-overlay" role="dialog" aria-label={title}>
      <div className="pin-box">
        {onClose && (
          <button className="pin-close secondary" onClick={onClose} aria-label={t.common.close}>
            <X />
          </button>
        )}
        <h2>{title}</h2>
        {note && <p className="muted">{note}</p>}
        <div className="pin-dots" aria-hidden>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span key={i} className={i < pin.length ? 'full' : ''} />
          ))}
        </div>
        <p className="pin-error" role="alert">
          {error}
        </p>
        <div className="pin-keys">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="secondary" onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <span />
          <button className="secondary" onClick={() => press('0')}>
            0
          </button>
          <button className="secondary" onClick={() => setPin(pin.slice(0, -1))} aria-label={t.parent.deleteDigit}>
            <Delete />
          </button>
        </div>
      </div>
    </div>
  )
}
