import { ArrowLeft, ArrowRight } from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import { starterAccess } from '@/access/access'
import { useStudio } from '@/app/studio'
import { BackupError, parseBackup, restoreBackup } from '@/data/backup'
import { requestPersistence } from '@/data/persist'
import { useT } from '@/i18n'
import { guessSystem } from '@/lessons/classes'
import { AccessEditor, ChildEditor } from '@/parent/editors'
import { ParentGate } from '@/parent/ParentGate'
import { Emoji } from '@/shared/Emoji'
import { startDemo } from './demo'
import './Setup.css'

type Step = 'welcome' | 'child' | 'pin' | 'access' | 'done'
const STEPS: Step[] = ['welcome', 'child', 'pin', 'access', 'done']

/**
 * First start: set up (child → parent PIN → what is switched on), try the demo, or restore a backup.
 * Everything typed here is saved on this device only.
 */
export function SetupWizard() {
  const t = useT()
  const { settings, updateSettings, age, stage } = useStudio()
  const [step, setStep] = useState<Step>('welcome')
  const [askPin, setAskPin] = useState(false)
  const at = STEPS.indexOf(step)
  const go = (s: Step) => setStep(s)

  const toPin = () => {
    // Keep the class shown on the child page (a guess by age until the parent picks one).
    if (!settings.child.school) updateSettings((s) => ({ ...s, child: { ...s.child, school: { system: guessSystem(), stage } } }))
    go('pin')
  }
  const toAccess = () => {
    // The proposal by age, which the parent can change on the next page.
    updateSettings((s) => ({ ...s, access: starterAccess(age) }))
    go('access')
  }
  const finish = () => {
    void requestPersistence()
    updateSettings((s) => ({ ...s, setupDone: true }))
  }

  return (
    <div className="setup">
      <div className="setup-card card">
        {step !== 'welcome' && (
          <div className="setup-progress" aria-label={t.setup.stepOf(at, STEPS.length - 1)}>
            {STEPS.slice(1).map((s, i) => (
              <i key={s} className={i < at ? 'done' : ''} />
            ))}
          </div>
        )}

        {step === 'welcome' && <Welcome onStart={() => go('child')} />}

        {step === 'child' && (
          <>
            <h2>{t.setup.childTitle}</h2>
            <ChildEditor showTheme={false} />
            <Nav onBack={() => go('welcome')} onNext={toPin} />
          </>
        )}

        {step === 'pin' && (
          <>
            <h2>{t.setup.pinTitle}</h2>
            <p>{t.setup.pinText}</p>
            <p className="setup-check">
              <Emoji name={settings.pin ? 'sparkles' : 'locked'} size={32} /> {settings.pin ? t.setup.pinSet : t.setup.pinNotSet}
            </p>
            <button onClick={() => setAskPin(true)}>{settings.pin ? t.setup.pinChange : t.setup.pinChoose}</button>
            <Nav onBack={() => go('child')} onNext={toAccess} nextDisabled={!settings.pin} />
            {askPin && (
              <ParentGate
                change
                onOpen={() => {
                  setAskPin(false)
                  toAccess()
                }}
                onClose={() => setAskPin(false)}
              />
            )}
          </>
        )}

        {step === 'access' && (
          <>
            <h2>{t.setup.accessTitle}</h2>
            <p>{t.setup.accessText(age)}</p>
            <AccessEditor />
            <Nav onBack={() => go('pin')} onNext={() => go('done')} />
          </>
        )}

        {step === 'done' && (
          <>
            <Emoji name="party" size={110} />
            <h2>{t.setup.doneTitle}</h2>
            <ul className="setup-tips">
              <li>{t.setup.tipInstall}</li>
              <li>{t.setup.tipBackup}</li>
              <li>{t.setup.tipParents}</li>
            </ul>
            <Nav onBack={() => go('access')} onNext={finish} nextLabel={t.setup.start} />
          </>
        )}
      </div>
    </div>
  )
}

function Nav({ onBack, onNext, nextDisabled, nextLabel }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string }) {
  const t = useT()
  return (
    <div className="setup-nav">
      <button className="secondary" onClick={onBack}>
        <ArrowLeft /> {t.common.back}
      </button>
      <button onClick={onNext} disabled={nextDisabled}>
        {nextLabel ?? t.common.next} <ArrowRight />
      </button>
    </div>
  )
}

function Welcome({ onStart }: { onStart: () => void }) {
  const t = useT()
  const file = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const demo = async () => {
    setBusy(true)
    await startDemo()
  }
  const restore = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const b = parseBackup(await f.text())
      setBusy(true)
      await restoreBackup(b)
      void requestPersistence()
      location.reload()
    } catch (err) {
      setError(err instanceof BackupError ? t.backup.errors[err.message as keyof typeof t.backup.errors] ?? t.backup.errors.other : t.backup.errors.other)
    }
  }

  return (
    <div className="welcome">
      <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={120} height={120} />
      <h1>{t.appName}</h1>
      <p>{t.setup.welcomeText}</p>
      <ul className="welcome-points">
        <li>
          <Emoji name="locked" size={28} /> {t.about.privacy}
        </li>
        <li>
          <Emoji name="glowstar" size={28} /> {t.setup.welcomeStars}
        </li>
      </ul>
      <div className="welcome-actions">
        <button onClick={onStart} disabled={busy}>
          {t.setup.setUp} <ArrowRight />
        </button>
        <button className="secondary" onClick={() => void demo()} disabled={busy}>
          <Emoji name="sparkles" size={26} /> {t.setup.tryDemo}
        </button>
        <button className="secondary" onClick={() => file.current?.click()} disabled={busy}>
          <Emoji name="memo" size={26} /> {t.setup.restore}
        </button>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => void restore(e)} />
      </div>
      {error && (
        <p className="parent-error" role="alert">
          {error}
        </p>
      )}
      <small className="muted">{t.developedBy}</small>
    </div>
  )
}
