'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LinkText } from '../LinkText'
import { useAuth3 } from '../AuthContext'
import { AmendSheetModal } from './AmendSheetModal'
import { useT } from '@/i18n/LocaleContext'
import type { Character } from '@/payload-types'

const QUOTES: Record<string, string> = {
  'Ashryn Vael': 'If a god needs me to keep her from dying, perhaps she is no god of mine.',
  'Halren Stoke': 'The other me died at the Throne of the Protector. I keep his sword sharp out of courtesy.',
  'Veska Tho': "You can't sing a god back. But you can keep their note from finishing.",
  'Drevan Kor': 'Below, I learned what bones whisper. They mostly complain about weather.',
}

const lexicalText = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: { children?: any[] } }).root
  if (!root) return ''
  const out: string[] = []
  const walk = (n: any) => {
    if (!n) return
    if (n.type === 'text' && typeof n.text === 'string') out.push(n.text)
    if (Array.isArray(n.children)) for (const c of n.children) walk(c)
  }
  for (const c of root.children || []) walk(c)
  return out.join(' ').trim()
}

export const Dramatis: React.FC<{ characters: Character[] }> = ({ characters }) => {
  const auth = useAuth3()
  const { t } = useT()
  const [sel, setSel] = useState<number | null>(null)

  if (sel != null) {
    const c = characters.find((x) => x.id === sel)
    if (c) return <PartyDetail c={c} onBack={() => setSel(null)} />
  }

  return (
    <div>
      <div className="dramatis-head">
        <div>
          <div className="eyebrow-sm">{t('party.eyebrow')}</div>
          <h2>
            {t('party.headline.a')} <em>{t('party.headline.b')}</em>
            <br /> {t('party.headline.c')} <em>{t('party.headline.d')}</em>
          </h2>
        </div>
        <div className="sub">
          {characters.length === 1 ? t('party.sub.one') : t('party.sub.many', { n: characters.length })}{' '}
          {t('party.sub.tail')}
        </div>
      </div>

      <div className="dramatis-rail">
        {characters.map((c) => {
          const hue = c.accentHue ?? 285
          const portrait = `linear-gradient(135deg, oklch(0.42 0.18 ${hue}), oklch(0.16 0.06 ${(hue + 60) % 360}))`
          const mine = !!auth?.isPlayer && auth.user?.pcSlug === c.slug
          const quote = c.quote || QUOTES[c.name] || (lexicalText(c.backstory).split('.')[0] || '') + '.'
          return (
            <div
              key={c.id}
              className={'persona persona-clickable' + (mine ? ' persona-mine' : '')}
              onClick={() => setSel(c.id as number)}
            >
              <div
                className="persona-portrait"
                style={{ ['--portrait-bg' as string]: portrait, background: portrait } as React.CSSProperties}
              >
                <div className="persona-glyph">
                  {c.name.split(' ').map((w) => w[0]).join('')}
                </div>
                {mine && (
                  <div className="persona-mark" title={t('party.yourCharacter.title')}>
                    {t('party.yourCharacter')}
                  </div>
                )}
                <div className="persona-meta">
                  <span>{c.race}</span>
                  <span>
                    {t('party.lvl', {
                      n: c.level ?? 1,
                      player: c.playerLabel || (typeof c.player === 'object' && c.player ? c.player.name || '' : ''),
                    })}
                  </span>
                </div>
              </div>
              <div className="persona-body">
                <h3 className="persona-name">{c.name}</h3>
                <div className="persona-class">{c.class}</div>
                <div className="persona-quote">“{quote}”</div>
                <div className="persona-stats">
                  {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((k) => {
                    const v = (c.stats as Record<string, number> | null | undefined)?.[k] ?? 10
                    return (
                      <div key={k} className="persona-stat">
                        <div className="k">{k}</div>
                        <div className="v">{v}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="persona-foot">
                  <span>{t('party.k.hp')} {c.vitals?.hpCurrent ?? '?'}/{c.vitals?.hpMax ?? '?'}</span>
                  <span>{t('party.k.ac')} {c.vitals?.ac ?? '?'}</span>
                  <span className="persona-open">{t('party.openSheet')}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PartyDetail: React.FC<{ c: Character; onBack: () => void }> = ({ c, onBack }) => {
  const auth = useAuth3()
  const router = useRouter()
  const { t } = useT()
  const [editing, setEditing] = useState(false)
  const hue = c.accentHue ?? 285
  const portrait = `linear-gradient(135deg, oklch(0.42 0.18 ${hue}), oklch(0.16 0.06 ${(hue + 60) % 360}))`
  const canEdit = auth.canEditPC(c.slug)
  const mine = !!auth?.isPlayer && auth.user?.pcSlug === c.slug
  const quote = c.quote || QUOTES[c.name]
  const playerName = c.playerLabel || (typeof c.player === 'object' && c.player ? c.player.name || '' : '')

  return (
    <div className="party-detail">
      <div className="party-detail-back" onClick={onBack}>
        {t('party.back')}
      </div>

      <div className="party-detail-grid">
        <div className="pd-portrait" style={{ background: portrait }}>
          <div className="pd-portrait-glyph">{c.name.split(' ').map((w) => w[0]).join('')}</div>
          {mine && <div className="persona-mark">{t('party.yourCharacter')}</div>}
        </div>

        <div className="pd-main">
          <div className="eyebrow-sm">
            {t('party.subhead', { race: c.race || '', klass: c.class, lvl: c.level ?? 1 })}
          </div>
          <h1 className="pd-name">{c.name}</h1>
          <div className="pd-class">{t('party.playedBy', { name: playerName })}</div>

          {quote && <div className="pd-quote">“{quote}”</div>}

          <div className="pd-vitals">
            <div className="pd-vital">
              <div className="k">{t('party.k.hp')}</div>
              <div className="v">
                {c.vitals?.hpCurrent ?? '?'} <span className="m">/ {c.vitals?.hpMax ?? '?'}</span>
              </div>
            </div>
            <div className="pd-vital">
              <div className="k">{t('party.k.ac')}</div>
              <div className="v">{c.vitals?.ac ?? '?'}</div>
            </div>
            <div className="pd-vital">
              <div className="k">{t('party.k.level')}</div>
              <div className="v">{c.level}</div>
            </div>
            <div className="pd-vital">
              <div className="k">{t('party.k.player')}</div>
              <div className="v" style={{ fontSize: 22 }}>{playerName}</div>
            </div>
          </div>

          <div className="pd-section">
            <div className="pd-section-title">{t('party.section.abilities')}</div>
            <div className="pd-stats">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((k) => {
                const v = (c.stats as Record<string, number> | null | undefined)?.[k] ?? 10
                const m = Math.floor((v - 10) / 2)
                return (
                  <div key={k} className="pd-stat">
                    <div className="k">{k}</div>
                    <div className="v">{v}</div>
                    <div className="m">{m >= 0 ? '+' : ''}{m}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pd-section">
            <div className="pd-section-title">{t('party.section.backstory')}</div>
            <p className="pd-backstory">
              <LinkText text={lexicalText(c.backstory)} />
            </p>
          </div>

          <div className="pd-section">
            <div className="pd-section-title">
              {t('party.section.gear')} <span className="pd-section-count">{(c.gear || []).length}</span>
            </div>
            <ul className="pd-gear">
              {(c.gear || []).map((g, i) => (
                <li key={i}>
                  <LinkText text={g.name} />
                </li>
              ))}
            </ul>
          </div>

          <div className="pd-edit-row">
            {canEdit ? (
              <span
                className="persona-edit"
                style={{ cursor: 'pointer' }}
                onClick={() => setEditing(true)}
              >
                {mine ? t('party.amend.your') : t('party.amend.other')}
              </span>
            ) : (
              <span className="persona-edit-muted">
                {t('party.amend.locked', { name: playerName })}
              </span>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <AmendSheetModal
          character={c}
          onClose={() => setEditing(false)}
          onSubmitted={() => {
            setEditing(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
