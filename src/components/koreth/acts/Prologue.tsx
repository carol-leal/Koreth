'use client'

import React from 'react'
import { LinkText } from '../LinkText'
import { useTip } from '../TipContext'
import { useT } from '@/i18n/LocaleContext'
import type { Character, Campaign } from '@/payload-types'

type Props = {
  campaign: Campaign
  characters: Character[]
  goto: (idx: number) => void
}

// Hardcoded in V3 source (app-v3.jsx:208-214); kept here verbatim.
const NEXT_SESSION = {
  when: 'Next Saturday · 8pm',
  where: "Mateo's flat (or VTT if rain)",
  title: 'The Trial Begins',
  plan:
    "The Choir takes their seats in the Solar Inquisition's gallery. Isene Vallow speaks for the prosecution; Jayn't has refused counsel.",
}

export const Prologue: React.FC<Props> = ({ campaign, characters, goto }) => {
  const { show, hide } = useTip()
  const { t } = useT()
  const currentSession = campaign.currentSession ?? 0
  const partyLevel = campaign.partyLevel ?? Math.round(characters.reduce((a, c) => a + (c.level ?? 0), 0) / Math.max(1, characters.length))
  const partyXp = campaign.partyXp ?? 0
  const nextLevelXp = campaign.nextLevelXp ?? 0

  return (
    <div className="prologue">
      <div className="prologue-left">
        <div className="eyebrow-sm">{t('prologue.eyebrow')}</div>
        <h1 className="prologue-title">
          <span className="prologue-title-main">Korêth</span>
          <span className="prologue-title-sub">
            <em>{t('prologue.subtitle')}</em>
          </span>
        </h1>
        <div className="prologue-tag">
          “{campaign.tagline}”
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic' }}>
            {campaign.tagSource}
          </div>
        </div>
        <div className="prologue-meta">
          <div className="item">
            <div className="k">{t('prologue.k.session')}</div>
            <div className="v">{currentSession}</div>
          </div>
          <div className="item">
            <div className="k">{t('prologue.k.party')}</div>
            <div className="v">{t('prologue.lvl', { n: partyLevel })}</div>
          </div>
          <div className="item">
            <div className="k">{t('prologue.k.era')}</div>
            <div className="v">Yr 350</div>
          </div>
          <div className="item">
            <div className="k">{t('prologue.k.lastEntry')}</div>
            <div className="v">2h ago</div>
          </div>
        </div>
      </div>

      <div className="prologue-right">
        {/* NEXT SESSION CARD */}
        <div className="next-card">
          <div className="next-head">
            <div className="next-eye">{t('prologue.next.eye')}</div>
            <div className="next-num">№ {String(currentSession + 1).padStart(2, '0')}</div>
          </div>
          <h3 className="next-title">{NEXT_SESSION.title}</h3>
          <div className="next-meta-row">
            <div className="next-meta">
              <div className="k">{t('prologue.next.k.when')}</div>
              <div className="v">{NEXT_SESSION.when}</div>
            </div>
            <div className="next-meta">
              <div className="k">{t('prologue.next.k.where')}</div>
              <div className="v">{NEXT_SESSION.where}</div>
            </div>
          </div>
          <div className="next-plan">
            <LinkText text={NEXT_SESSION.plan} />
          </div>
        </div>

        {/* PARTY ROSTER */}
        <div className="party-card">
          <div className="party-card-head">
            <h3>
              {campaign.partyName || t('prologue.party.defaultName')} <em>· {t('prologue.party.rosterEm')}</em>
            </h3>
            <span className="party-card-meta">{t('prologue.party.sharedMeta')}</span>
          </div>

          <div className="party-shared">
            <div className="party-shared-level">{partyLevel}</div>
            <div className="party-shared-info">
              <div className="party-shared-title">{t('prologue.party.sharedTitle')}</div>
              <div className="party-shared-xp">
                {t('prologue.party.xp', { xp: partyXp.toLocaleString() })}{' '}
                <em>{t('prologue.party.xpToNext', { n: nextLevelXp.toLocaleString() })}</em>
              </div>
              <div className="party-shared-bar">
                <div
                  className="fill"
                  style={{ width: nextLevelXp > 0 ? Math.round((partyXp / nextLevelXp) * 100) + '%' : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="party-roster">
            {characters.map((c) => {
              const portrait = `linear-gradient(135deg, oklch(0.42 0.18 ${c.accentHue ?? 285}), oklch(0.16 0.06 ${((c.accentHue ?? 285) + 60) % 360}))`
              const cur = c.vitals?.hpCurrent ?? 0
              const max = c.vitals?.hpMax ?? 1
              const hpPct = Math.round((cur / max) * 100)
              return (
                <div
                  className="roster-row"
                  key={c.id}
                  onMouseEnter={(e) => show(c.name, e.currentTarget)}
                  onMouseLeave={hide}
                >
                  <div className="roster-portrait" style={{ background: portrait }}>
                    {c.name.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div className="roster-text">
                    <div className="roster-name">{c.name}</div>
                    <div className="roster-class">
                      {c.race} {c.class}
                    </div>
                  </div>
                  <div className="roster-hp">
                    <div className="roster-hp-bar">
                      <div className="fill" style={{ width: hpPct + '%' }} />
                    </div>
                    <div className="roster-hp-num">
                      {cur}/{max}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SMALL DETAIL ROW */}
        <div className="prol-details">
          <div className="prol-detail">
            <div className="k">{t('prologue.detail.inWorld')}</div>
            <div className="v">Yr 350, late spring</div>
          </div>
          <div className="prol-detail">
            <div className="k">{t('prologue.detail.currentlyIn')}</div>
            <div className="v">Aureth, capital of Aurion</div>
          </div>
          <div className="prol-detail">
            <div className="k">{t('prologue.detail.holding')}</div>
            <div className="v">Awaiting the trial of Jayn’t</div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <ChapterCue n="II" label={t('prologue.cue.codex')} onClick={() => goto(1)} />
          <ChapterCue n="III" label={t('prologue.cue.chronicle')} onClick={() => goto(2)} />
          <ChapterCue n="IV" label={t('prologue.cue.party')} onClick={() => goto(3)} />
        </div>
      </div>
    </div>
  )
}

const ChapterCue: React.FC<{ n: string; label: string; onClick: () => void }> = ({ n, label, onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1,
      padding: '14px 16px',
      border: '1px solid var(--line)',
      borderRadius: 12,
      cursor: 'default',
      transition: 'border-color 160ms, background 160ms',
      background: 'linear-gradient(180deg, oklch(1 0 0 / 0.02), transparent)',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-soft)')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
  >
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '.18em',
        color: 'var(--ink-4)',
      }}
    >
      {n}
    </div>
    <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 17, marginTop: 4 }}>
      {label}
    </div>
  </div>
)
