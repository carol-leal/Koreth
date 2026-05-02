'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/i18n/LocaleContext'
import { useAuth3 } from '../AuthContext'
import { textToLexical, lexicalToText } from '../textLexical'
import type { DictKey } from '@/i18n'
import type { Deity } from '@/payload-types'

const TIER_PROSE_KEY: Record<NonNullable<Deity['tier']>, DictKey> = {
  Primordial: 'god.tier.primordial',
  Greater: 'god.tier.greater',
  Lesser: 'god.tier.lesser',
  Dark: 'god.tier.dark',
}

const TIER_LABEL_KEY: Record<NonNullable<Deity['tier']>, DictKey> = {
  Primordial: 'pantheon.tier.primordial',
  Greater: 'pantheon.tier.greater',
  Lesser: 'pantheon.tier.lesser',
  Dark: 'pantheon.tier.dark',
}

const num = (s: string): number | null => {
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export const GodModal: React.FC<{
  god: Deity & { hue?: number }
  onClose: () => void
  initialEditing?: boolean
}> = ({ god, onClose, initialEditing = false }) => {
  const { t } = useT()
  const auth = useAuth3()
  const router = useRouter()
  const canEdit = auth.canEditAny

  const [editing, setEditing] = useState(initialEditing && canEdit)
  const hue = god.hue ?? 75
  const symBg = `linear-gradient(135deg, oklch(0.5 0.18 ${hue}), oklch(0.25 0.08 ${(hue + 60) % 360}))`

  if (editing && canEdit) {
    return (
      <GodEditView
        god={god}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          router.refresh()
        }}
        onDeleted={() => {
          setEditing(false)
          onClose()
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="god-modal-bg" onClick={onClose}>
      <div
        className="god-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ ['--k-hue' as string]: hue } as React.CSSProperties}
      >
        <div className="god-modal-hero">
          <div className="god-modal-symbol" style={{ background: symBg }}>
            {god.symbol || '·'}
          </div>
          <div>
            <div className="god-modal-eye">{t('god.eye', { tier: god.tier })}</div>
            <h2>{god.name}</h2>
          </div>
          {canEdit && (
            <div
              className="cd-amend"
              style={{ marginRight: 40, cursor: 'pointer' }}
              onClick={() => setEditing(true)}
              title={t('codex.amend.title')}
            >
              ✎ {t('codex.amend')}
            </div>
          )}
          <div className="god-modal-close" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="god-modal-body">
          <div className="god-modal-grid">
            <div className="kv">
              <div className="k">{t('god.kv.domain')}</div>
              <div className="v">{god.domain}</div>
            </div>
            <div className="kv">
              <div className="k">{t('god.kv.alignment')}</div>
              <div className="v">{god.alignment || '—'}</div>
            </div>
            <div className="kv">
              <div className="k">{t('god.kv.symbol')}</div>
              <div className="v">{god.symbol}</div>
            </div>
            <div className="kv">
              <div className="k">{t('god.kv.holySymbol')}</div>
              <div className="v">{god.holySymbol || '—'}</div>
            </div>
            <div className="kv">
              <div className="k">{t('god.kv.tier')}</div>
              <div className="v">{t(TIER_LABEL_KEY[god.tier])}</div>
            </div>
          </div>
          <p className="god-modal-prose">
            {t('god.prose', {
              name: god.name,
              tier: t(TIER_PROSE_KEY[god.tier]),
              domain: (god.domain || '').toLowerCase(),
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

const GodEditView: React.FC<{
  god: Deity
  onCancel: () => void
  onSaved: () => void
  onDeleted: () => void
}> = ({ god, onCancel, onSaved, onDeleted }) => {
  const { t } = useT()
  const [name, setName] = useState(god.name)
  const [tier, setTier] = useState<NonNullable<Deity['tier']>>(god.tier)
  const [domain, setDomain] = useState(god.domain || '')
  const [alignment, setAlignment] = useState(god.alignment || '')
  const [symbol, setSymbol] = useState(god.symbol || '')
  const [holySymbol, setHolySymbol] = useState(god.holySymbol || '')
  const [status, setStatus] = useState(god.status || 'alive')
  const [lastSeen, setLastSeen] = useState(god.lastSeen || '')
  const [accentHue, setAccentHue] = useState(String(god.accentHue ?? ''))
  const [description, setDescription] = useState(lexicalToText(god.description))
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  const remove = async () => {
    if (!confirm(t('pantheon.delete.confirm'))) return
    setDeleting(true)
    setErr('')
    try {
      const res = await fetch(`/api/deities/${god.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('codex.err.generic'))
      }
      onDeleted()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const submit = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(`/api/deities/${god.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tier,
          domain: domain.trim(),
          alignment: alignment.trim(),
          symbol: symbol.trim(),
          holySymbol: holySymbol.trim(),
          status,
          lastSeen: lastSeen.trim(),
          accentHue: accentHue ? num(accentHue) : null,
          description: description.trim() ? textToLexical(description) : null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('codex.err.generic'))
      }
      onSaved()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const monoEye: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '.22em',
    color: 'var(--ink-3)',
    textTransform: 'uppercase',
  }

  return (
    <div className="modal-bg2">
      <div className="modal2" onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 92vw)' }}>
        <div className="modal2-head">
          <div>
            <div style={monoEye}>{t('codex.amend.eye')}</div>
            <h2>
              {god.name} <em>{t('folio.titleEdit')}</em>
            </h2>
          </div>
          <div className="modal2-close" onClick={onCancel}>✕</div>
        </div>

        <div className="modal2-body">
          <div>
            <label className="f-label">{t('codex.f.name')}</label>
            <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('pantheon.f.tier')}</label>
              <select
                className="f-input"
                value={tier}
                onChange={(e) => setTier(e.target.value as NonNullable<Deity['tier']>)}
              >
                {(['Primordial', 'Greater', 'Lesser', 'Dark'] as const).map((tn) => (
                  <option key={tn} value={tn}>
                    {t(TIER_LABEL_KEY[tn])}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="f-label">{t('pantheon.f.domain')}</label>
              <input className="f-input" value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('pantheon.f.alignment')}</label>
              <input className="f-input" value={alignment} onChange={(e) => setAlignment(e.target.value)} />
            </div>
            <div>
              <label className="f-label">{t('codex.f.accentHue')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={accentHue}
                onChange={(e) => setAccentHue(e.target.value)}
              />
            </div>
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('pantheon.f.symbol')}</label>
              <input className="f-input" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </div>
            <div>
              <label className="f-label">{t('pantheon.f.holySymbol')}</label>
              <input className="f-input" value={holySymbol} onChange={(e) => setHolySymbol(e.target.value)} />
            </div>
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('codex.f.status')}</label>
              <select className="f-input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                {['withdrawn', 'silent', 'alive', 'rising', 'exiled', 'dead'].map((s) => (
                  <option key={s} value={s}>
                    {t(`codex.deityStatus.${s}` as any)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="f-label">{t('pantheon.f.lastSeen')}</label>
              <input className="f-input" value={lastSeen} onChange={(e) => setLastSeen(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="f-label">{t('codex.f.description')}</label>
            <textarea
              className="f-textarea"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          <button className="btn3 btn3-danger" onClick={remove} disabled={busy || deleting} type="button">
            {deleting ? t('codex.btn.deleting') : t('pantheon.btn.delete')}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onCancel}>{t('folio.btn.cancel')}</button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy || deleting}>
              {busy ? t('codex.btn.saving') : t('codex.btn.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
