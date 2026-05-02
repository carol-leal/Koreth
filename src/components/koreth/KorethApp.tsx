'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Atmo } from './Atmo'
import { Tip } from './Tip'
import { TipProvider } from './TipContext'
import { AuthProvider, type SessionUser } from './AuthContext'
import { PersonaPill } from './PersonaPill'
import { LocaleSwitcher } from './LocaleSwitcher'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import { Prologue } from './acts/Prologue'
import { Codex } from './acts/Codex'
import { Chronicle } from './acts/Chronicle'
import { Dramatis } from './acts/Dramatis'
import { Quests } from './acts/Quests'
import { Timeline } from './acts/Timeline'
import { Cartography } from './acts/Cartography'
import { ACTS, type KorethData } from './types'
import type { EntityIndexEntry } from '@/utilities/getEntityIndex'

type Props = {
  data: KorethData
  user: SessionUser
  entities: EntityIndexEntry[]
}

export const KorethApp: React.FC<Props> = ({ data, user, entities }) => {
  return (
    <AuthProvider user={user}>
      <TipProvider entities={entities}>
        <KorethShell data={data} />
      </TipProvider>
    </AuthProvider>
  )
}

const KorethShell: React.FC<{ data: KorethData }> = ({ data }) => {
  const { t } = useT()
  const [act, setAct] = useState(0)
  const spreadRef = useRef<HTMLDivElement>(null)
  const sortedSessions = [...data.sessions].sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
  const [chrSel, setChrSel] = useState<number | null>((sortedSessions[0]?.id as number) ?? null)

  useEffect(() => {
    const el = spreadRef.current
    if (!el) return
    el.scrollTo({ left: act * window.innerWidth, behavior: 'smooth' })
  }, [act])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.matches?.('input,textarea,select') || t?.isContentEditable) return
      // Don't navigate while a modal is open.
      if (document.querySelector('.modal-bg2')) return
      if (e.key === 'ArrowRight') setAct((a) => Math.min(ACTS.length - 1, a + 1))
      if (e.key === 'ArrowLeft') setAct((a) => Math.max(0, a - 1))
      const n = parseInt(e.key)
      if (!isNaN(n) && n >= 1 && n <= ACTS.length) setAct(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Resync scroll position on resize so each pane stays full-width.
  useEffect(() => {
    const onResize = () => {
      const el = spreadRef.current
      if (!el) return
      el.scrollTo({ left: act * window.innerWidth })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [act])

  return (
    <>
      <Atmo />
      <div className="shell">
        <div className="rail">
          <div className="rail-brand">
            <div className="rail-mark" />
            <div>
              <div className="rail-name">Koreth</div>
              <div className="rail-sub">
                {t('rail.brandSub', { n: data.campaign.currentSession ?? 0 })}
              </div>
            </div>
          </div>
          <div className="acts">
            {ACTS.map((a, i) => (
              <div
                key={a.id}
                className={'act' + (i === act ? ' active' : '')}
                onClick={() => setAct(i)}
              >
                <span className="act-num">{String(i + 1).padStart(2, '0')}</span>
                {t(a.labelKey as DictKey)}
              </div>
            ))}
          </div>
          <div className="rail-meta">
            <PersonaPill />
            <LocaleSwitcher />
          </div>
        </div>

        <div className="spread" ref={spreadRef}>
          <div className="act-pane">
            <Prologue
              campaign={data.campaign}
              characters={data.characters}
              goto={(i) => setAct(i)}
            />
          </div>
          <div className="act-pane">
            <Codex data={data} />
          </div>
          <div className="act-pane">
            <Chronicle sel={chrSel} setSel={setChrSel} sessions={data.sessions} />
          </div>
          <div className="act-pane">
            <Timeline events={data.events} />
          </div>
          <div className="act-pane">
            <Dramatis characters={data.characters} />
          </div>
          <div className="act-pane">
            <Quests quests={data.quests} leads={data.leads} sessions={data.sessions} />
          </div>
          <div className="act-pane">
            <Cartography />
          </div>
        </div>
      </div>

      <Tip />

      <div className="foot-hint">
        <span className="kbd-key">←</span>
        <span className="kbd-key">→</span>
        <span>{t('foot.turnPage')}</span>
      </div>
    </>
  )
}
