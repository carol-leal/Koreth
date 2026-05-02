'use client'

import React, { useState } from 'react'
import { textToLexical, lexicalToText } from '../textLexical'
import { useT } from '@/i18n/LocaleContext'
import { useAuth3 } from '../AuthContext'
import { PortraitUpload } from '../PortraitUpload'
import type { Character, Media } from '@/payload-types'

type Props = {
  character: Character
  onClose: () => void
  onSubmitted: () => void
  /** Called after a successful delete. Parent should clear its selection. */
  onDeleted?: () => void
}

const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const

export const AmendSheetModal: React.FC<Props> = ({ character: c, onClose, onSubmitted, onDeleted }) => {
  const { t } = useT()
  const auth = useAuth3()
  const [name, setName] = useState(c.name)
  const [klass, setKlass] = useState(c.class)
  const [subclass, setSubclass] = useState(c.subclass || '')
  const [race, setRace] = useState(c.race || '')
  const [level, setLevel] = useState(String(c.level ?? 1))
  const [quote, setQuote] = useState(c.quote || '')
  const [accentHue, setAccentHue] = useState(String(c.accentHue ?? 285))
  const [playerLabel, setPlayerLabel] = useState(c.playerLabel || '')
  const [retired, setRetired] = useState<boolean>(!!c.retired)
  const [portrait, setPortrait] = useState<Media | number | string | null | undefined>(c.portrait ?? null)
  const [portraitId, setPortraitId] = useState<number | null>(
    typeof c.portrait === 'object' && c.portrait
      ? (c.portrait.id as number)
      : typeof c.portrait === 'number'
        ? c.portrait
        : null,
  )
  const [hpCur, setHpCur] = useState(String(c.vitals?.hpCurrent ?? ''))
  const [hpMax, setHpMax] = useState(String(c.vitals?.hpMax ?? ''))
  const [ac, setAc] = useState(String(c.vitals?.ac ?? ''))
  const initialStats = (c.stats as Record<string, number> | null | undefined) ?? {}
  const [stats, setStats] = useState<Record<string, string>>(
    Object.fromEntries(ABILITIES.map((k) => [k, String(initialStats[k] ?? 10)])),
  )
  const [backstory, setBackstory] = useState(lexicalToText(c.backstory))
  const initialGear = (c.gear || []).map((g) => g.name).join('\n')
  const [gear, setGear] = useState(initialGear)
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  const remove = async () => {
    if (!auth.canEditAny) return
    if (!confirm(t('sheet.delete.confirm'))) return
    setDeleting(true)
    setErr('')
    try {
      const res = await fetch(`/api/characters/${c.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('sheet.err.generic'))
      }
      ;(onDeleted || onSubmitted)()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const num = (s: string): number | null => {
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const submit = async () => {
    if (!name.trim()) return
    setBusy(true)
    setErr('')
    try {
      const data: Record<string, unknown> = {
        name: name.trim(),
        class: klass.trim(),
        subclass: subclass.trim(),
        race: race.trim(),
        level: num(level) ?? 1,
        quote: quote.trim(),
        accentHue: num(accentHue) ?? 285,
        vitals: {
          hpCurrent: num(hpCur),
          hpMax: num(hpMax),
          ac: num(ac),
        },
        stats: Object.fromEntries(ABILITIES.map((k) => [k, num(stats[k]) ?? 10])),
        backstory: textToLexical(backstory),
        gear: gear
          .split('\n')
          .map((g) => g.trim())
          .filter(Boolean)
          .map((g) => ({ name: g })),
        portrait: portraitId,
        retired,
      }
      if (auth.canEditAny) {
        data.playerLabel = playerLabel.trim()
      }
      const res = await fetch(`/api/characters/${c.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('sheet.err.generic'))
      }
      onSubmitted()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-bg2">
      <div
        className="modal2"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(720px, 92vw)' }}
      >
        <div className="modal2-head">
          <div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '.22em',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
              }}
            >
              {t('sheet.eye')}
            </div>
            <h2>{t('sheet.title', { name: c.name })}</h2>
          </div>
          <div className="modal2-close" onClick={onClose}>
            ✕
          </div>
        </div>

        <div className="modal2-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div>
              <label className="f-label">{t('portrait.label')}</label>
              <PortraitUpload
                value={portrait}
                alt={name}
                onChange={(id) => {
                  setPortraitId(id)
                  if (id == null) setPortrait(null)
                }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="f-label">{t('sheet.f.name')}</label>
                <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="f-label">{t('sheet.f.class')}</label>
                <input className="f-input" value={klass} onChange={(e) => setKlass(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="f-row">
            <div>
              <label className="f-label">{t('sheet.f.subclass')}</label>
              <input className="f-input" value={subclass} onChange={(e) => setSubclass(e.target.value)} />
            </div>
            <div>
              <label className="f-label">{t('sheet.f.race')}</label>
              <input className="f-input" value={race} onChange={(e) => setRace(e.target.value)} />
            </div>
          </div>
          <div className="f-row">
            <div>
              <label className="f-label">{t('sheet.f.level')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">{t('sheet.f.accentHue')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={accentHue}
                onChange={(e) => setAccentHue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="f-label">{t('sheet.f.quote')}</label>
            <input
              className="f-input"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder={t('sheet.f.quotePlaceholder')}
            />
          </div>
          {auth.canEditAny && (
            <div>
              <label className="f-label">{t('sheet.f.playerLabel')}</label>
              <input
                className="f-input"
                value={playerLabel}
                onChange={(e) => setPlayerLabel(e.target.value)}
              />
            </div>
          )}

          <label className="f-checkbox-row">
            <input
              type="checkbox"
              checked={retired}
              onChange={(e) => setRetired(e.target.checked)}
            />
            <span>
              <strong>{t('sheet.f.retired')}</strong>
              <em>{t('sheet.f.retired.help')}</em>
            </span>
          </label>

          <div>
            <label className="f-label">{t('sheet.f.vitals')}</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
              }}
            >
              <Vital label={t('sheet.v.hpCur')} value={hpCur} onChange={setHpCur} />
              <Vital label={t('sheet.v.hpMax')} value={hpMax} onChange={setHpMax} />
              <Vital label={t('sheet.v.ac')} value={ac} onChange={setAc} />
            </div>
          </div>

          <div>
            <label className="f-label">{t('sheet.f.abilities')}</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 8,
              }}
            >
              {ABILITIES.map((k) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      letterSpacing: '0.16em',
                      color: 'var(--ink-4)',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      marginBottom: 4,
                    }}
                  >
                    {k}
                  </div>
                  <input
                    className="f-input"
                    inputMode="numeric"
                    style={{ textAlign: 'center', fontFamily: 'var(--display)', fontSize: 18 }}
                    value={stats[k]}
                    onChange={(e) => setStats({ ...stats, [k]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="f-label">{t('sheet.f.backstory')}</label>
            <textarea
              className="f-textarea"
              rows={6}
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
            />
          </div>

          <div>
            <label className="f-label">{t('sheet.f.gear')}</label>
            <textarea
              className="f-textarea"
              rows={5}
              value={gear}
              onChange={(e) => setGear(e.target.value)}
              placeholder="Sundered Censer (focus)\nStar-iron mace"
            />
          </div>

          {err && (
            <div
              style={{
                color: 'oklch(0.7 0.16 28)',
                fontSize: 13,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {err}
            </div>
          )}
        </div>

        <div className="modal2-foot">
          {auth.canEditAny ? (
            <button className="btn3 btn3-danger" onClick={remove} disabled={busy || deleting} type="button">
              {deleting ? t('sheet.btn.deleting') : t('sheet.btn.delete')}
            </button>
          ) : (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '.18em',
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
              }}
            >
              {t('sheet.foot')}
            </span>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onClose}>
              {t('sheet.btn.cancel')}
            </button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy || deleting}>
              {busy ? t('sheet.btn.saving') : t('sheet.btn.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Vital: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        letterSpacing: '0.16em',
        color: 'var(--ink-4)',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <input
      className="f-input"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)
