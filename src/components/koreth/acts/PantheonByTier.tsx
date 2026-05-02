'use client'

import React, { useState } from 'react'
import { GodModal } from './GodModal'
import type { Deity } from '@/payload-types'

const TIERS: { id: Deity['tier']; title: string; sub: string; hue: number }[] = [
  { id: 'Primordial', title: 'The Primordials', sub: 'First, withdrawn — worshipped only in fragments.', hue: 215 },
  { id: 'Greater', title: 'The Greater Gods', sub: 'Guardians of order. Many have grown silent.', hue: 75 },
  { id: 'Lesser', title: 'The Lesser Gods', sub: 'Rising. Ambitious. Increasingly heard.', hue: 145 },
  { id: 'Dark', title: 'The Six Dark', sub: 'Exiled. Cults persist in the deep places of Koreth.', hue: 25 },
]

export const PantheonByTier: React.FC<{ pantheon: Deity[] }> = ({ pantheon }) => {
  const [openGod, setOpenGod] = useState<(Deity & { hue: number }) | null>(null)
  return (
    <div className="pantheon-tiers">
      {TIERS.map((t) => {
        const gods = pantheon.filter((g) => g.tier === t.id)
        if (!gods.length) return null
        return (
          <div className="pn-tier" key={t.id} style={{ ['--k-hue' as string]: t.hue } as React.CSSProperties}>
            <div className="pn-tier-head">
              <div>
                <div className="pn-tier-eye">
                  {gods.length} {gods.length === 1 ? 'deity' : 'deities'}
                </div>
                <h3 className="pn-tier-title">{t.title}</h3>
              </div>
              <div className="pn-tier-sub">{t.sub}</div>
            </div>
            <div className="pantheon-table">
              <div className="th">Symbol</div>
              <div className="th">Name</div>
              <div className="th">Domain</div>
              <div className="th">Alignment</div>
              {gods.map((g) => (
                <div className="pantheon-row" key={g.id} onClick={() => setOpenGod({ ...g, hue: t.hue })}>
                  <div className="pn-symbol">{g.symbol || '·'}</div>
                  <div className="pn-name">{g.name}</div>
                  <div className="pn-domain">{g.domain}</div>
                  <div className="pn-align">{g.alignment || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {openGod && <GodModal god={openGod} onClose={() => setOpenGod(null)} />}
    </div>
  )
}
