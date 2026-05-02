'use client'

import React from 'react'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { Deity } from '@/payload-types'

const TIER_PROSE_KEY: Record<NonNullable<Deity['tier']>, DictKey> = {
  Primordial: 'god.tier.primordial',
  Greater: 'god.tier.greater',
  Lesser: 'god.tier.lesser',
  Dark: 'god.tier.dark',
}

export const GodModal: React.FC<{ god: Deity & { hue?: number }; onClose: () => void }> = ({
  god,
  onClose,
}) => {
  const { t } = useT()
  const hue = god.hue ?? 75
  const symBg = `linear-gradient(135deg, oklch(0.5 0.18 ${hue}), oklch(0.25 0.08 ${(hue + 60) % 360}))`
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
              <div className="v">
                {god.symbol}
                <span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 6 }}>{t('god.symbol.note')}</span>
              </div>
            </div>
            <div className="kv">
              <div className="k">{t('god.kv.tier')}</div>
              <div className="v">{god.tier}</div>
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
