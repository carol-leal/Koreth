'use client'

import React, { useState } from 'react'
import { useT } from '@/i18n/LocaleContext'
import type { Campaign } from '@/payload-types'

type Props = {
  campaign: Campaign
  onClose: () => void
  onSubmitted: () => void
}

const num = (s: string): number | null => {
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export const EditCampaignModal: React.FC<Props> = ({ campaign, onClose, onSubmitted }) => {
  const { t } = useT()

  const [tagline, setTagline] = useState(campaign.tagline || '')
  const [tagSource, setTagSource] = useState(campaign.tagSource || '')
  const [currentSession, setCurrentSession] = useState(String(campaign.currentSession ?? 0))
  const [era, setEra] = useState(campaign.era || '')
  const [currentInWorldDate, setCurrentInWorldDate] = useState(campaign.currentInWorldDate || '')
  const [currentlyIn, setCurrentlyIn] = useState(campaign.currentlyIn || '')
  const [holding, setHolding] = useState(campaign.holding || '')
  const [partyName, setPartyName] = useState(campaign.partyName || '')
  const [partyLevel, setPartyLevel] = useState(String(campaign.partyLevel ?? 0))
  const [partyXp, setPartyXp] = useState(String(campaign.partyXp ?? 0))
  const [nextLevelXp, setNextLevelXp] = useState(String(campaign.nextLevelXp ?? 0))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/globals/campaign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: tagline.trim(),
          tagSource: tagSource.trim(),
          currentSession: num(currentSession),
          era: era.trim(),
          currentInWorldDate: currentInWorldDate.trim(),
          currentlyIn: currentlyIn.trim(),
          holding: holding.trim(),
          partyName: partyName.trim(),
          partyLevel: num(partyLevel),
          partyXp: num(partyXp),
          nextLevelXp: num(nextLevelXp),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('campaign.err.generic'))
      }
      onSubmitted()
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
    <div className="modal-bg2" onClick={onClose}>
      <div className="modal2" onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 92vw)' }}>
        <div className="modal2-head">
          <div>
            <div style={monoEye}>{t('campaign.edit.eye')}</div>
            <h2>{t('campaign.edit.title')}</h2>
          </div>
          <div className="modal2-close" onClick={onClose}>✕</div>
        </div>

        <div className="modal2-body">
          <div>
            <label className="f-label">{t('campaign.f.tagline')}</label>
            <textarea
              className="f-textarea"
              rows={2}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">{t('campaign.f.tagSource')}</label>
            <input className="f-input" value={tagSource} onChange={(e) => setTagSource(e.target.value)} />
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('campaign.f.currentSession')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={currentSession}
                onChange={(e) => setCurrentSession(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">{t('campaign.f.era')}</label>
              <input className="f-input" value={era} onChange={(e) => setEra(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="f-label">{t('campaign.f.currentInWorldDate')}</label>
            <input
              className="f-input"
              value={currentInWorldDate}
              onChange={(e) => setCurrentInWorldDate(e.target.value)}
            />
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('campaign.f.currentlyIn')}</label>
              <input className="f-input" value={currentlyIn} onChange={(e) => setCurrentlyIn(e.target.value)} />
            </div>
            <div>
              <label className="f-label">{t('campaign.f.holding')}</label>
              <input className="f-input" value={holding} onChange={(e) => setHolding(e.target.value)} />
            </div>
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('campaign.f.partyName')}</label>
              <input className="f-input" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
            </div>
            <div>
              <label className="f-label">{t('campaign.f.partyLevel')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={partyLevel}
                onChange={(e) => setPartyLevel(e.target.value)}
              />
            </div>
          </div>

          <div className="f-row">
            <div>
              <label className="f-label">{t('campaign.f.partyXp')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={partyXp}
                onChange={(e) => setPartyXp(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">{t('campaign.f.nextLevelXp')}</label>
              <input
                className="f-input"
                inputMode="numeric"
                value={nextLevelXp}
                onChange={(e) => setNextLevelXp(e.target.value)}
              />
            </div>
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
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '.18em',
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
            }}
          >
            {t('campaign.foot')}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onClose}>{t('folio.btn.cancel')}</button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy}>
              {busy ? t('campaign.btn.saving') : t('campaign.btn.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
