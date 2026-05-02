'use client'

import React, { useState } from 'react'
import { GodModal } from './GodModal'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { Deity } from '@/payload-types'

const TIERS: { id: Deity['tier']; titleKey: DictKey; subKey: DictKey; hue: number }[] = [
  { id: 'Primordial', titleKey: 'pantheon.tier.primordial.title', subKey: 'pantheon.tier.primordial.sub', hue: 215 },
  { id: 'Greater', titleKey: 'pantheon.tier.greater.title', subKey: 'pantheon.tier.greater.sub', hue: 75 },
  { id: 'Lesser', titleKey: 'pantheon.tier.lesser.title', subKey: 'pantheon.tier.lesser.sub', hue: 145 },
  { id: 'Dark', titleKey: 'pantheon.tier.dark.title', subKey: 'pantheon.tier.dark.sub', hue: 25 },
]

export const PantheonByTier: React.FC<{ pantheon: Deity[] }> = ({ pantheon }) => {
  const { t } = useT()
  const [openGod, setOpenGod] = useState<(Deity & { hue: number }) | null>(null)
  return (
    <div className="pantheon-tiers">
      {TIERS.map((tier) => {
        const gods = pantheon.filter((g) => g.tier === tier.id)
        if (!gods.length) return null
        return (
          <div className="pn-tier" key={tier.id} style={{ ['--k-hue' as string]: tier.hue } as React.CSSProperties}>
            <div className="pn-tier-head">
              <div>
                <div className="pn-tier-eye">
                  {gods.length} {gods.length === 1 ? t('pantheon.deity') : t('pantheon.deities')}
                </div>
                <h3 className="pn-tier-title">{t(tier.titleKey)}</h3>
              </div>
              <div className="pn-tier-sub">{t(tier.subKey)}</div>
            </div>
            <div className="pantheon-table">
              <div className="th">{t('pantheon.col.symbol')}</div>
              <div className="th">{t('pantheon.col.name')}</div>
              <div className="th">{t('pantheon.col.domain')}</div>
              <div className="th">{t('pantheon.col.alignment')}</div>
              {gods.map((g) => (
                <div className="pantheon-row" key={g.id} onClick={() => setOpenGod({ ...g, hue: tier.hue })}>
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
