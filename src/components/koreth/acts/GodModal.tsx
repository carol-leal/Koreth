'use client'

import React from 'react'
import type { Deity } from '@/payload-types'

const tierProse = (tier: Deity['tier']): string => {
  switch (tier) {
    case 'Primordial':
      return 'the First — older than the Weave'
    case 'Greater':
      return 'the Greater Choir, whose silence frames our age'
    case 'Lesser':
      return 'the Lesser, who still answer when called rightly'
    case 'Dark':
      return 'the Six Dark, whom the wise refuse to name aloud'
  }
}

export const GodModal: React.FC<{ god: Deity & { hue?: number }; onClose: () => void }> = ({
  god,
  onClose,
}) => {
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
            <div className="god-modal-eye">{god.tier} deity</div>
            <h2>{god.name}</h2>
          </div>
          <div className="god-modal-close" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="god-modal-body">
          <div className="god-modal-grid">
            <div className="kv">
              <div className="k">Domain</div>
              <div className="v">{god.domain}</div>
            </div>
            <div className="kv">
              <div className="k">Alignment</div>
              <div className="v">{god.alignment || '—'}</div>
            </div>
            <div className="kv">
              <div className="k">Symbol</div>
              <div className="v">
                {god.symbol}
                <span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 6 }}>worn by clergy</span>
              </div>
            </div>
            <div className="kv">
              <div className="k">Tier</div>
              <div className="v">{god.tier}</div>
            </div>
          </div>
          <p className="god-modal-prose">
            <em>{god.name}</em> is counted among <em>{tierProse(god.tier)}</em>. Their domain is{' '}
            <strong>{(god.domain || '').toLowerCase()}</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
