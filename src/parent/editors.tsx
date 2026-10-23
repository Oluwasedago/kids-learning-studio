import { type AccessChange, changeAccess } from '@/access/access'
import { GROUPS, ITEMS, itemsIn, type ItemId } from '@/access/catalogue'
import { useStudio } from '@/app/studio'
import { ACCENTS } from '@/data/types'
import { LANGS, LOCALES, useLang, useT } from '@/i18n'
import { classesOf, guessSystem, SCHOOL_SYSTEMS, type SchoolSystem } from '@/lessons/classes'
import { stageTags } from '@/lessons/ladder'
import { Emoji } from '@/shared/Emoji'
import { THEME_MODES } from '@/shared/theme'
import './Parent.css'

// Settings controls used by both the setup wizard and the parent screen. They change the settings directly.

/** Name, birth month and year (never the day), the child's colour and light/dark. */
export function ChildEditor({ showTheme = true }: { showTheme?: boolean }) {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { settings, updateSettings, now } = useStudio()
  const child = settings.child
  const setChild = (change: Partial<typeof child>) => updateSettings((s) => ({ ...s, child: { ...s.child, ...change } }))
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 2 - i)
  return (
    <div className="editor">
      <label className="field">
        <span>{t.setup.nameLabel}</span>
        <input value={child.name} maxLength={30} autoComplete="off" placeholder={t.setup.namePlaceholder} onChange={(e) => setChild({ name: e.target.value })} />
        <small className="muted">{t.setup.nameNote}</small>
      </label>
      <div className="field-row">
        <label className="field">
          <span>{t.setup.birthMonth}</span>
          <select value={child.birthMonth} onChange={(e) => setChild({ birthMonth: Number(e.target.value) })}>
            {Array.from({ length: 12 }, (_, m) => (
              <option key={m} value={m + 1}>
                {new Date(2000, m, 1).toLocaleDateString(locale, { month: 'long' })}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.setup.birthYear}</span>
          <select value={child.birthYear} onChange={(e) => setChild({ birthYear: Number(e.target.value) })}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <small className="muted">{t.setup.birthNote}</small>
      <ClassEditor />
      <span className="field-label">{t.setup.colour}</span>
      <div className="swatches" role="radiogroup" aria-label={t.setup.colour}>
        {ACCENTS.map((c) => (
          <button key={c} role="radio" aria-checked={child.accent === c} className={`swatch ${child.accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setChild({ accent: c })} aria-label={c} />
        ))}
      </div>
      {showTheme && (
        <>
          <LanguagePicker />
          <span className="field-label">{t.setup.theme}</span>
          <div className="segmented">
            {THEME_MODES.map((m) => (
              <button key={m} className={settings.theme === m ? '' : 'secondary'} onClick={() => updateSettings((s) => ({ ...s, theme: m }))}>
                {t.setup.themes[m]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** The app language (English, Deutsch, Français), each named in itself. */
export function LanguagePicker() {
  const t = useT()
  const lang = useLang()
  const { updateSettings } = useStudio()
  return (
    <>
      <span className="field-label">{t.language.label}</span>
      <div className="segmented" role="radiogroup" aria-label={t.language.label}>
        {LANGS.map((l) => (
          <button key={l.id} role="radio" aria-checked={lang === l.id} lang={l.id} className={lang === l.id ? '' : 'secondary'} onClick={() => updateSettings((s) => ({ ...s, lang: l.id }))}>
            {l.name}
          </button>
        ))}
      </div>
      <small className="muted">{t.language.note}</small>
    </>
  )
}

/**
 * The child's school class: a school system (for the class names) and the class. The class sets the lesson
 * level; changing it moves every subject to the start of the new class at once.
 */
export function ClassEditor() {
  const t = useT()
  const { settings, updateSettings, updateProgress, stage, age } = useStudio()
  const school = settings.child.school
  const system = school?.system ?? guessSystem()
  const setSchool = (next: { system: SchoolSystem; stage: number }) => {
    updateSettings((s) => ({ ...s, child: { ...s.child, school: next } }))
    // A new class: every subject starts again at that class's level (levelOf falls back to it).
    if (next.stage !== stage) updateProgress((p) => ({ ...p, levels: {}, recent: {} }))
  }
  const tags = stageTags(stage)
  return (
    <>
      <div className="field-row">
        <label className="field">
          <span>{t.setup.schoolSystem}</span>
          <select value={system} onChange={(e) => setSchool({ system: e.target.value as SchoolSystem, stage })}>
            {SCHOOL_SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>
                {t.setup.schoolSystems[s.id]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t.setup.schoolClass}</span>
          <select value={stage} onChange={(e) => setSchool({ system, stage: Number(e.target.value) })}>
            {classesOf(system).map((c) => (
              <option key={c.stage} value={c.stage}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="editor-note">
        <Emoji name="gradcap" size={28} /> {t.setup.classLine(tags.cambridge, tags.us, tags.berlin)} {!school && t.setup.classGuess(age)}
      </p>
      <small className="muted">{t.setup.classNote}</small>
    </>
  )
}

/**
 * The two layers for every item: On/Off (off = hidden from the child), then Locked (opens with earned time)
 * or Unlocked. Items whose screen comes in a later version are shown as "coming soon".
 */
export function AccessEditor() {
  const t = useT()
  const { settings, updateSettings, today } = useStudio()
  const change = (id: ItemId, c: AccessChange) => updateSettings((s) => ({ ...s, access: { ...s.access, [id]: changeAccess(s.access[id], c, today) } }))
  return (
    <div className="access-editor">
      {GROUPS.map((g) => (
        <div key={g} className="access-group">
          <h4>{t.groups[g]}</h4>
          {itemsIn(g).map((id) => {
            const rule = settings.access[id]
            const on = Boolean(rule?.enabled)
            const ready = ITEMS[id].ready
            return (
              <div key={id} className={`access-row ${on ? '' : 'off'}`}>
                <Emoji name={ITEMS[id].emoji} size={36} />
                <span className="access-name">
                  <b>{t.items[id]}</b>
                  {!ready && <small className="muted">{t.access.comingSoon}</small>}
                  {ready && on && !rule.unlocked && rule.unlockedOn === today && <small className="pill">{t.access.unlockedToday}</small>}
                </span>
                <div className="segmented compact">
                  <button className={on ? '' : 'secondary'} onClick={() => change(id, 'enable')} aria-pressed={on}>
                    {t.common.on}
                  </button>
                  <button className={on ? 'secondary' : ''} onClick={() => change(id, 'disable')} aria-pressed={!on}>
                    {t.common.off}
                  </button>
                </div>
                <div className="segmented compact" aria-disabled={!on}>
                  <button className={on && !rule.unlocked ? '' : 'secondary'} disabled={!on} onClick={() => change(id, 'lock')}>
                    <Emoji name="locked" size={20} /> {t.access.earn}
                  </button>
                  <button className={on && rule.unlocked ? '' : 'secondary'} disabled={!on} onClick={() => change(id, 'unlock')}>
                    {t.access.open}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <p className="muted">{t.access.explain}</p>
    </div>
  )
}
