import { X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useStudio } from '@/app/studio'
import { LOCALES, useLang, useT } from '@/i18n'
import { makePin, newRecoveryCode, normalizeCode, pinMatches, resetReadyAt } from './pin'
import { PinPad } from './PinPad'

type Step = 'enter' | 'create' | 'confirm' | 'code' | 'forgot'

/**
 * Asks for the parent PIN, or (no PIN yet, or `change`) asks to choose one twice. `onOpen` runs after the right
 * PIN. After 5 wrong tries the pad waits 30 seconds, so guessing is slow.
 * A new PIN comes with a new recovery code, shown once. "Forgot the PIN?" accepts that code, or asks for a
 * reset that is possible after 24 hours (see pin.ts); the right PIN cancels a waiting reset.
 */
export function ParentGate({ change = false, note, onOpen, onClose }: { change?: boolean; note?: string; onOpen: () => void; onClose?: () => void }) {
  const t = useT()
  const { settings, updateSettings } = useStudio()
  const [step, setStep] = useState<Step>(change || !settings.pin ? 'create' : 'enter')
  const [first, setFirst] = useState('')
  const [error, setError] = useState('')
  const [wrong, setWrong] = useState(0)
  const [waitUntil, setWaitUntil] = useState(0)
  const [code, setCode] = useState('')

  const onPin = async (pin: string) => {
    if (Date.now() < waitUntil) return setError(t.parent.wait)
    if (step === 'enter') {
      if (await pinMatches(pin, settings.pin)) {
        // The parent is here: a reset someone else asked for is cancelled.
        if (settings.pinReset) updateSettings((s) => ({ ...s, pinReset: null }))
        return onOpen()
      }
      const n = wrong + 1
      setWrong(n)
      if (n % 5 === 0) setWaitUntil(Date.now() + 30_000)
      setError(n % 5 === 0 ? t.parent.wait : t.parent.wrongPin)
    } else if (step === 'create') {
      setFirst(pin)
      setStep('confirm')
      setError('')
    } else if (pin === first) {
      const fresh = newRecoveryCode()
      const [stored, recovery] = await Promise.all([makePin(pin), makePin(normalizeCode(fresh))])
      updateSettings((s) => ({ ...s, pin: stored, recovery, pinReset: null }))
      setCode(fresh)
      setStep('code')
    } else {
      setStep('create')
      setError(t.parent.pinsDiffer)
    }
  }

  if (step === 'code') return <RecoveryCode code={code} onDone={onOpen} />
  if (step === 'forgot')
    return (
      <Forgot
        onClose={onClose}
        onNewPin={() => {
          setError('')
          setStep('create')
        }}
        onBack={() => setStep('enter')}
      />
    )

  const title = step === 'enter' ? t.parent.enterPin : step === 'create' ? t.parent.createPin : t.parent.confirmPin
  return (
    <PinPad
      title={title}
      note={note}
      error={error}
      onPin={(p) => void onPin(p)}
      onClose={onClose}
      footer={
        step === 'enter' && (
          <>
            {settings.pinReset && <ResetNotice requestedAt={settings.pinReset.requestedAt} />}
            <button className="link-button" onClick={() => setStep('forgot')}>
              {t.recovery.forgotPin}
            </button>
          </>
        )
      }
    />
  )
}

function Box({ title, onClose, children }: { title: string; onClose?: () => void; children: ReactNode }) {
  const t = useT()
  return (
    <div className="pin-overlay" role="dialog" aria-label={title}>
      <div className="pin-box recovery-box">
        {onClose && (
          <button className="pin-close secondary" onClick={onClose} aria-label={t.common.close}>
            <X />
          </button>
        )}
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

/** The new recovery code, shown once, after a PIN is chosen. */
export function RecoveryCode({ code, onDone }: { code: string; onDone: () => void }) {
  const t = useT()
  return (
    <Box title={t.recovery.title}>
      <p className="recovery-code">{code}</p>
      <p>{t.recovery.text}</p>
      <button onClick={onDone}>{t.recovery.saved}</button>
    </Box>
  )
}

/** "Forgot the PIN?": type the recovery code, or ask for a reset in 24 hours. */
function Forgot({ onNewPin, onBack, onClose }: { onNewPin: () => void; onBack: () => void; onClose?: () => void }) {
  const t = useT()
  const { settings, updateSettings, now } = useStudio()
  const [typed, setTyped] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const reset = settings.pinReset
  const ready = reset !== null && now.getTime() >= resetReadyAt(reset.requestedAt)

  const check = async () => {
    setChecking(true)
    const ok = settings.recovery !== null && (await pinMatches(normalizeCode(typed), settings.recovery))
    setChecking(false)
    if (ok) onNewPin()
    else setError(t.recovery.codeWrong)
  }

  return (
    <Box title={t.recovery.forgotTitle} onClose={onClose}>
      {settings.recovery && (
        <form
          className="recovery-form"
          onSubmit={(e) => {
            e.preventDefault()
            void check()
          }}
        >
          <label className="field">
            <span>{t.recovery.codeLabel}</span>
            <input value={typed} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXX-XXXX-XXXX" onChange={(e) => setTyped(e.target.value)} />
          </label>
          <p className="pin-error" role="alert">
            {error}
          </p>
          <button type="submit" disabled={normalizeCode(typed).length < 12 || checking}>
            {t.recovery.check}
          </button>
        </form>
      )}
      {ready ? (
        <>
          <p>{t.recovery.ready}</p>
          <button onClick={onNewPin}>{t.recovery.chooseNew}</button>
        </>
      ) : reset ? (
        <ResetNotice requestedAt={reset.requestedAt} />
      ) : (
        <>
          <p className="muted">{settings.recovery ? t.recovery.noCode : t.recovery.noCodeYet}</p>
          <button className="secondary" onClick={() => updateSettings((s) => ({ ...s, pinReset: { requestedAt: Date.now() } }))}>
            {t.recovery.askReset}
          </button>
        </>
      )}
      <button className="link-button" onClick={onBack}>
        {t.common.back}
      </button>
    </Box>
  )
}

/** A reset is waiting: when it becomes possible, and that the PIN cancels it. */
function ResetNotice({ requestedAt }: { requestedAt: number }) {
  const t = useT()
  const locale = LOCALES[useLang()]
  const when = new Date(resetReadyAt(requestedAt)).toLocaleString(locale, { weekday: 'long', hour: 'numeric', minute: '2-digit' })
  return (
    <p className="recovery-pending" role="status">
      {t.recovery.pending(when)}
    </p>
  )
}
