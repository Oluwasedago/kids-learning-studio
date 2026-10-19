import { type AccessChange, changeAccess } from '@/access/access'
import { GROUPS, ITEMS, itemsIn, type ItemId } from '@/access/catalogue'
import { useStudio } from '@/app/studio'
import { ACCENTS } from '@/data/types'
import { LOCALES, useLang, useT } from '@/i18n'
import { stageForAge, stageTags } from '@/lessons/ladder'
import { Emoji } from '@/shared/Emoji'
import { THEME_MODES } from '@/shared/theme'
import './Parent.css'

// Settings controls used by both the setup wizard and the parent screen. They change the settings directly.

/** Name, birth month and year (never the day), the child's colour and light/dark. */
export function ChildEditor({ showTheme = true }: { showTheme?: boolean }) {
  const t = useT()
  const locale = LOCALES[useLang()]
  const { settings, updateSettings, age, now } = useStudio()
  const child = settings.child
  const setChild = (change: Partial<typeof child>) => updateSettings((s) => ({ ...s, child: { ...s.child, ...change } }))
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 2 - i)
  const tags = stageTags(stageForAge(age))
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
      <p className="editor-note">
        <Emoji name="gradcap" size={28} /> {t.setup.ageLine(age, tags.cambridge, tags.us, tags.berlin)}
      </p>
      <small className="muted">{t.setup.birthNote}</small>
      <span className="field-label">{t.setup.colour}</span>
      <div className="swatches" role="radiogroup" aria-label={t.setup.colour}>
        {ACCENTS.map((c) => (
          <button key={c} role="radio" aria-checked={child.accent === c} className={`swatch ${child.accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setChild({ accent: c })} aria-label={c} />
        ))}
      </div>
      {showTheme && (
        <>
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
