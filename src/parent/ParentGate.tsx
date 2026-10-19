import { useState } from 'react'
import { useStudio } from '@/app/studio'
import { useT } from '@/i18n'
import { makePin, pinMatches } from './pin'
import { PinPad } from './PinPad'

type Step = 'enter' | 'create' | 'confirm'

/**
 * Asks for the parent PIN, or (no PIN yet, or `change`) asks to choose one twice. `onOpen` runs after the right
 * PIN. After 5 wrong tries the pad waits 30 seconds, so guessing is slow.
 */
export function ParentGate({ change = false, note, onOpen, onClose }: { change?: boolean; note?: string; onOpen: () => void; onClose?: () => void }) {
  const t = useT()
  const { settings, updateSettings } = useStudio()
  const [step, setStep] = useState<Step>(change || !settings.pin ? 'create' : 'enter')
  const [first, setFirst] = useState('')
  const [error, setError] = useState('')
  const [wrong, setWrong] = useState(0)
  const [waitUntil, setWaitUntil] = useState(0)

  const onPin = async (pin: string) => {
    if (Date.now() < waitUntil) return setError(t.parent.wait)
    if (step === 'enter') {
      if (await pinMatches(pin, settings.pin)) return onOpen()
      const n = wrong + 1
      setWrong(n)
      if (n % 5 === 0) setWaitUntil(Date.now() + 30_000)
      setError(n % 5 === 0 ? t.parent.wait : t.parent.wrongPin)
    } else if (step === 'create') {
      setFirst(pin)
      setStep('confirm')
      setError('')
    } else if (pin === first) {
      const stored = await makePin(pin)
      updateSettings((s) => ({ ...s, pin: stored }))
      onOpen()
    } else {
      setStep('create')
      setError(t.parent.pinsDiffer)
    }
  }

  const title = step === 'enter' ? t.parent.enterPin : step === 'create' ? t.parent.createPin : t.parent.confirmPin
  return <PinPad title={title} note={note} error={error} onPin={(p) => void onPin(p)} onClose={onClose} />
}
