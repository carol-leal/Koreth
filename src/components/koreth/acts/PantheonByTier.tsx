'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GodModal } from './GodModal'
import { useAuth3 } from '../AuthContext'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { Deity } from '@/payload-types'

const TIERS: { id: Deity['tier']; titleKey: DictKey; subKey: DictKey; hue: number }[] = [
  { id: 'Primordial', titleKey: 'pantheon.tier.primordial.title', subKey: 'pantheon.tier.primordial.sub', hue: 215 },
  { id: 'Greater', titleKey: 'pantheon.tier.greater.title', subKey: 'pantheon.tier.greater.sub', hue: 75 },
  { id: 'Lesser', titleKey: 'pantheon.tier.lesser.title', subKey: 'pantheon.tier.lesser.sub', hue: 145 },
  { id: 'Dark', titleKey: 'pantheon.tier.dark.title', subKey: 'pantheon.tier.dark.sub', hue: 25 },
]

type OpenSpec = { id: number; hue: number; edit: boolean; fallback: Deity }

export const PantheonByTier: React.FC<{ pantheon: Deity[] }> = ({ pantheon }) => {
  const { t } = useT()
  const auth = useAuth3()
  const router = useRouter()
  const [openSpec, setOpenSpec] = useState<OpenSpec | null>(null)
  const [busy, setBusy] = useState(false)

  // Re-derive the modal's deity from the latest pantheon list each render so
  // edits flow in as soon as router.refresh() resolves. Falls back to the
  // captured doc for the brief window before a freshly-created deity appears
  // in the refreshed list.
  const openGod = openSpec
    ? {
        ...(pantheon.find((g) => g.id === openSpec.id) ?? openSpec.fallback),
        hue: openSpec.hue,
      }
    : null

  const createDeity = async () => {
    if (busy) return
    setBusy(true)
    try {
      const base = t('pantheon.new.untitled')
      const taken = new Set(pantheon.map((d) => d.name))
      let name = base
      for (let n = 2; taken.has(name); n++) name = `${base} ${n}`
      const res = await fetch('/api/deities', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tier: 'Lesser',
          domain: '',
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || res.statusText)
      }
      const j = await res.json()
      const doc = (j.doc || j) as Deity
      setOpenSpec({ id: doc.id as number, hue: 145, edit: true, fallback: doc })
      router.refresh()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pantheon-tiers">
      {auth.canEditAny && (
        <div className="pantheon-add-row">
          <button className="lf-add" onClick={createDeity} disabled={busy} type="button">
            {busy ? t('pantheon.new.creating') : t('pantheon.new.button')}
          </button>
        </div>
      )}
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
                <div
                  className="pantheon-row"
                  key={g.id}
                  onClick={() =>
                    setOpenSpec({ id: g.id as number, hue: tier.hue, edit: false, fallback: g })
                  }
                >
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
      {openGod && openSpec && (
        <GodModal
          key={openSpec.id}
          god={openGod}
          initialEditing={openSpec.edit}
          onClose={() => setOpenSpec(null)}
        />
      )}
    </div>
  )
}
