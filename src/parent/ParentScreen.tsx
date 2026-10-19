import { Minus, Plus, Trash2 } from 'lucide-react'
import { type ChangeEvent, type ReactNode, useRef, useState } from 'react'
import { useStudio } from '@/app/studio'
import { BackupError, backupDue, deleteAll, makeBackup, parseBackup, restoreBackup, saveBackup } from '@/data/backup'
import { usePersistence } from '@/data/persist'
import type { FamilyBirthday } from '@/data/types'
import { LOCALES, useLang, useT } from '@/i18n'
import { buildReport, mailtoUrl, reportText } from '@/reports/report'
import { Emoji } from '@/shared/Emoji'
import { AccessEditor, ChildEditor } from './editors'
import { ParentGate } from './ParentGate'
import './Parent.css'

/** The parent screen (behind the PIN): every setting, reports and backups. */
export function ParentScreen() {
  const t = useT()
  const { settings } = useStudio()
  return (
    <div className="parent-screen">
      {settings.demo && <DemoCard />}
      <Card emoji="backpack" title={t.parent.child}>
        <ChildEditor />
      </Card>
      <Card emoji="glowstar" title={t.parent.rewards}>
        <RewardsEditor />
      </Card>
      <Card emoji="chart" title={t.parent.reports} wide>
        <ReportCard />
      </Card>
      <Card emoji="locked" title={t.parent.access} wide>
        <AccessEditor />
      </Card>
      <Card emoji="memo" title={t.parent.backup}>
        <BackupCard />
      </Card>
      <Card emoji="cake" title={t.parent.birthdays}>
        <BirthdaysEditor />
      </Card>
      <Card emoji="gear" title={t.parent.security}>
        <SecurityCard />
      </Card>
      <Card emoji="heart" title={t.parent.about}>
        <p>
          <b>{t.appName}</b> · {t.developedBy}
        </p>
        <p>{t.about.privacy}</p>
        <p className="muted">{t.about.licence}</p>
        <p className="muted">{t.about.credits}</p>
      </Card>
    </div>
  )
}

function Card({ emoji, title, wide, children }: { emoji: string; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`card parent-card ${wide ? 'wide' : ''}`}>
      <h3 className="card-title">
        <Emoji name={emoji} size={36} /> {title}
      </h3>
      {children}
    </section>
  )
}

function Stepper({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  return (
    <div className="stepper-row">
      <span>{label}</span>
      <div className="stepper">
        <button className="secondary" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label={`${label} −`}>
          <Minus />
        </button>
        <strong>
          {value}
          {unit && <small> {unit}</small>}
        </strong>
        <button className="secondary" onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} aria-label={`${label} +`}>
          <Plus />
        </button>
      </div>
    </div>
  )
}

function RewardsEditor() {
  const t = useT()
  const { settings, updateSettings } = useStudio()
  const r = settings.rewards
  const set = (change: Partial<typeof r>) => updateSettings((s) => ({ ...s, rewards: { ...s.rewards, ...change } }))
  return (
    <div className="editor">
      <Stepper label={t.parent.missionsPerDay} value={r.missionsPerDay} min={1} max={4} onChange={(n) => set({ missionsPerDay: n })} />
      <Stepper label={t.parent.minutesPerStar} value={r.minutesPerStar} min={5} max={30} step={5} unit="min" onChange={(n) => set({ minutesPerStar: n })} />
      <Stepper label={t.parent.maxPerDay} value={r.maxMinutesPerDay} min={10} max={180} step={5} unit="min" onChange={(n) => set({ maxMinutesPerDay: n })} />
      <Stepper label={t.parent.weeklyGoal} value={r.weeklyGoal} min={3} max={28} onChange={(n) => set({ weeklyGoal: n })} />
      <label className="field">
        <span>{t.parent.weeklyReward}</span>
        <input value={r.weeklyReward} maxLength={40} placeholder={t.parent.weeklyRewardPlaceholder} onChange={(e) => set({ weeklyReward: e.target.value })} />
      </label>
    </div>
  )
}

function ReportCard() {
  const t = useT()
  const { settings, updateSettings, progress, usage, now, age } = useStudio()
  const period = settings.report.period
  const report = buildReport(progress, usage, period, now, age)
  const text = reportText(report, t, settings.child.name)
  const setReport = (change: Partial<typeof settings.report>) => updateSettings((s) => ({ ...s, report: { ...s.report, ...change } }))
  return (
    <div className="report">
      <div className="segmented">
        {(['day', 'week', 'month'] as const).map((p) => (
          <button key={p} className={period === p ? '' : 'secondary'} onClick={() => setReport({ period: p })}>
            {t.reports.periods[p]}
          </button>
        ))}
      </div>
      <div className="report-figures">
        <Figure emoji="calendar" value={report.activeDays} label={t.reports.days} />
        <Figure emoji="glowstar" value={report.stars} label={t.reports.stars} />
        <Figure emoji="gradcap" value={report.minutes.learning} label={t.reports.learningMin} />
        <Figure emoji="joystick" value={report.minutes.games} label={t.reports.gamesMin} />
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th>{t.reports.subject}</th>
            <th>{t.reports.missions}</th>
            <th>{t.reports.firstTry}</th>
            <th>{t.reports.nowLearning}</th>
          </tr>
        </thead>
        <tbody>
          {report.subjects
            .filter((s) => settings.access[s.subject]?.enabled)
            .map((s) => (
              <tr key={s.subject}>
                <td>{t.items[s.subject]}</td>
                <td>{s.missions}</td>
                <td>{s.accuracy === null ? '–' : `${Math.round(s.accuracy * 100)}%`}</td>
                <td>
                  {s.skill} <small className="muted">({t.learn.about(s.stage)})</small>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="report-mail">
        <label className="field">
          <span>{t.reports.emailTo}</span>
          <input type="email" value={settings.report.email} placeholder={t.reports.emailPlaceholder} autoComplete="email" onChange={(e) => setReport({ email: e.target.value.trim() })} />
        </label>
        <a className="button" href={mailtoUrl(settings.report.email, t.reports.emailSubject(settings.child.name, t.reports.periods[period]), text)}>
          <Emoji name="speech" size={26} /> {t.reports.emailButton}
        </a>
      </div>
      <small className="muted">{t.reports.emailNote}</small>
    </div>
  )
}

function Figure({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="figure">
      <Emoji name={emoji} size={34} />
      <b>{value}</b>
      <small>{label}</small>
    </div>
  )
}

function BackupCard() {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { settings, updateSettings, now } = useStudio()
  const { state, usedMb } = usePersistence()
  const file = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const last = settings.backup.lastAt

  const backup = async () => {
    setError('')
    const b = await makeBackup()
    if (await saveBackup(b)) {
      updateSettings((s) => ({ ...s, backup: { ...s.backup, lastAt: Date.now() } }))
      setMessage(t.backup.saved)
    }
  }
  const restore = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const b = parseBackup(await f.text())
      if (!confirm(t.backup.confirmRestore)) return
      await restoreBackup(b)
      location.reload()
    } catch (err) {
      setError(err instanceof BackupError ? t.backup.errors[err.message as keyof typeof t.backup.errors] ?? t.backup.errors.other : t.backup.errors.other)
    }
  }

  return (
    <div className="editor">
      <p className={backupDue(settings, now) ? 'backup-due' : ''}>
        {last ? t.backup.last(new Date(last).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })) : t.backup.never}
      </p>
      <div className="settings-buttons">
        <button onClick={() => void backup()} disabled={settings.demo}>
          {t.backup.now}
        </button>
        <button className="secondary" onClick={() => file.current?.click()}>
          {t.backup.restore}
        </button>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => void restore(e)} />
      </div>
      {message && <p role="status">{message}</p>}
      {error && (
        <p className="parent-error" role="alert">
          {error}
        </p>
      )}
      <Stepper label={t.backup.remindEvery} value={settings.backup.remindDays} min={1} max={60} unit={t.backup.days} onChange={(n) => updateSettings((s) => ({ ...s, backup: { ...s.backup, remindDays: n } }))} />
      <small className="muted">
        {state === 'persisted' ? t.storage.persisted : state === 'not-persisted' ? t.storage.notPersisted : t.storage.unknown}
        {usedMb && ` ${t.storage.used(usedMb)}`}
      </small>
      <small className="muted">{t.backup.private}</small>
    </div>
  )
}

function BirthdaysEditor() {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { settings, updateSettings } = useStudio()
  const [name, setName] = useState('')
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const add = () => {
    if (!name.trim()) return
    const b: FamilyBirthday = { id: crypto.randomUUID(), name: name.trim(), month, day }
    updateSettings((s) => ({ ...s, birthdays: [...s.birthdays, b] }))
    setName('')
  }
  const days = new Date(2024, month, 0).getDate()
  return (
    <div className="editor">
      <small className="muted">{t.parent.birthdaysNote}</small>
      <ul className="birthday-list">
        {settings.birthdays.map((b) => (
          <li key={b.id}>
            <span>
              <b>{b.name}</b> · {new Date(2024, b.month - 1, b.day).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
            </span>
            <button className="secondary" aria-label={t.common.remove} onClick={() => updateSettings((s) => ({ ...s, birthdays: s.birthdays.filter((x) => x.id !== b.id) }))}>
              <Trash2 />
            </button>
          </li>
        ))}
      </ul>
      <div className="birthday-add">
        <input value={name} maxLength={30} placeholder={t.parent.birthdayName} onChange={(e) => setName(e.target.value)} />
        <select value={day} onChange={(e) => setDay(Number(e.target.value))} aria-label={t.parent.day}>
          {Array.from({ length: days }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label={t.setup.birthMonth}>
          {Array.from({ length: 12 }, (_, m) => (
            <option key={m} value={m + 1}>
              {new Date(2000, m, 1).toLocaleDateString(locale, { month: 'short' })}
            </option>
          ))}
        </select>
        <button onClick={add} disabled={!name.trim()} aria-label={t.common.add}>
          <Plus />
        </button>
      </div>
    </div>
  )
}

function SecurityCard() {
  const t = useT()
  const [changePin, setChangePin] = useState(false)
  const [done, setDone] = useState(false)
  const wipe = async () => {
    if (!confirm(t.parent.deleteConfirm)) return
    await deleteAll()
    location.reload()
  }
  return (
    <div className="editor">
      <div className="settings-buttons">
        <button className="secondary" onClick={() => setChangePin(true)}>
          {t.parent.changePin}
        </button>
        <button className="secondary danger" onClick={() => void wipe()}>
          {t.parent.deleteAll}
        </button>
      </div>
      {done && <p role="status">{t.parent.pinChanged}</p>}
      <small className="muted">{t.parent.deleteNote}</small>
      {changePin && (
        <ParentGate
          change
          onOpen={() => {
            setChangePin(false)
            setDone(true)
          }}
          onClose={() => setChangePin(false)}
        />
      )}
    </div>
  )
}

/** Shown in the demo: the demo PIN, and the way out (which deletes the sample data). */
function DemoCard() {
  const t = useT()
  const leave = async () => {
    await deleteAll()
    location.reload()
  }
  return (
    <section className="card parent-card wide demo-card">
      <h3 className="card-title">
        <Emoji name="sparkles" size={36} /> {t.demo.title}
      </h3>
      <p>{t.demo.text}</p>
      <button onClick={() => void leave()}>{t.demo.leave}</button>
    </section>
  )
}
