'use client'

import React, { useState } from 'react'
import { useT } from '@/i18n/LocaleContext'
import { textToLexical, lexicalToText } from '../textLexical'
import { PortraitUpload } from '../PortraitUpload'
import type { CodexTabId, KorethData } from '../types'
import type { Media } from '@/payload-types'

type Props = {
  /** Pass an existing doc to edit, or omit / null to create a new one. */
  item?: any
  tab: CodexTabId
  data: KorethData
  onClose: () => void
  onSubmitted: () => void
  /** Called after a successful delete. Parent should clear its selection. */
  onDeleted?: () => void
}

const num = (s: string): number | null => {
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

const COLLECTION_BY_TAB: Record<Exclude<CodexTabId, 'pantheon'>, string> = {
  npcs: 'npcs',
  regions: 'regions',
  locations: 'locations',
  factions: 'factions',
  items: 'items',
  lore: 'lore',
}

const KIND_LABEL_KEY: Record<CodexTabId, string> = {
  npcs: 'codex.eyebrowFor.npcs',
  regions: 'codex.eyebrowFor.regions',
  locations: 'codex.eyebrowFor.locations',
  factions: 'codex.eyebrowFor.factions',
  items: 'codex.eyebrowFor.items',
  pantheon: 'codex.eyebrowFor.entry',
  lore: 'codex.eyebrowFor.lore',
}

export const CodexAmendModal: React.FC<Props> = ({ item, tab, data, onClose, onSubmitted, onDeleted }) => {
  const { t } = useT()
  const isCreate = !item || !item.id
  const seed = item || {}

  // Common — lore stores its label under `title`, every other tab uses `name`.
  const [name, setName] = useState<string>(seed.name || seed.title || '')
  const [accentHue, setAccentHue] = useState<string>(String(seed.accentHue ?? ''))
  const [portrait, setPortrait] = useState<Media | number | string | null | undefined>(seed.portrait ?? null)
  const [portraitId, setPortraitId] = useState<number | null>(
    typeof seed.portrait === 'object' && seed.portrait
      ? (seed.portrait.id as number)
      : typeof seed.portrait === 'number'
        ? seed.portrait
        : null,
  )
  // RichText description: stored as Lexical, edited as plain textarea.
  const descriptionInitial = lexicalToText(seed.description) || lexicalToText(seed.bio) || ''
  const [description, setDescription] = useState<string>(descriptionInitial)

  // NPC
  const [npcTitle, setNpcTitle] = useState<string>(seed.title || '')
  const [npcStatus, setNpcStatus] = useState<string>(seed.status || 'alive')
  const [npcCurrentLocationLabel, setNpcCurrentLocationLabel] = useState<string>(seed.currentLocationLabel || '')
  const [npcTags, setNpcTags] = useState<string>(
    Array.isArray(seed.tags) ? seed.tags.map((tg: any) => tg.tag).join(', ') : '',
  )

  // Region
  const [regionArea, setRegionArea] = useState<string>(seed.area || 'Centre')
  const [regionKind, setRegionKind] = useState<string>(seed.kind || '')
  const [regionTagline, setRegionTagline] = useState<string>(seed.tagline || '')

  // Location
  const initialRegionId =
    typeof seed.region === 'object' && seed.region ? String(seed.region.id) : seed.region ? String(seed.region) : ''
  const [locRegionId, setLocRegionId] = useState<string>(initialRegionId)
  const [locKind, setLocKind] = useState<string>(seed.kind || '')

  // Faction
  const [factionTone, setFactionTone] = useState<string>(seed.tone || 'Neutral')

  // Item
  const [itemKind, setItemKind] = useState<string>(seed.kind || '')
  const [itemRarity, setItemRarity] = useState<string>(seed.rarity || 'Common')
  const [itemOwnerLabel, setItemOwnerLabel] = useState<string>(seed.ownerLabel || '')

  // Lore
  const [loreKind, setLoreKind] = useState<string>(seed.kind || 'general')
  const [loreEra, setLoreEra] = useState<string>(seed.era || '')
  // Lore stores prose in `body` (textarea, not richText). Seed it from there.
  const [loreBody, setLoreBody] = useState<string>(typeof seed.body === 'string' ? seed.body : '')

  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  const remove = async () => {
    if (isCreate || !item?.id) return
    if (!confirm(t('codex.delete.confirm'))) return
    setDeleting(true)
    setErr('')
    try {
      const collection = COLLECTION_BY_TAB[tab as Exclude<CodexTabId, 'pantheon'>]
      const res = await fetch(`/api/${collection}/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('codex.err.generic'))
      }
      ;(onDeleted || onSubmitted)()
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
      const collection = COLLECTION_BY_TAB[tab as Exclude<CodexTabId, 'pantheon'>]
      const body: Record<string, unknown> = {
        accentHue: accentHue ? num(accentHue) : null,
        portrait: portraitId,
      }
      // Lore's required label is `title`; everything else uses `name`.
      if (tab === 'lore') body.title = name.trim()
      else body.name = name.trim()
      const lexical = description.trim() ? textToLexical(description) : null

      if (tab === 'npcs') {
        body.title = npcTitle.trim()
        body.status = npcStatus
        body.currentLocationLabel = npcCurrentLocationLabel.trim()
        body.tags = npcTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((tag) => ({ tag }))
        body.bio = lexical
      } else if (tab === 'regions') {
        body.area = regionArea
        body.kind = regionKind.trim()
        body.tagline = regionTagline.trim()
        body.description = lexical
      } else if (tab === 'locations') {
        body.region = locRegionId ? num(locRegionId) : null
        body.kind = locKind.trim()
        body.description = lexical
      } else if (tab === 'factions') {
        body.tone = factionTone
        body.description = lexical
      } else if (tab === 'items') {
        body.kind = itemKind.trim()
        body.rarity = itemRarity
        body.ownerLabel = itemOwnerLabel.trim()
        body.description = lexical
      } else if (tab === 'lore') {
        body.kind = loreKind
        body.era = loreEra.trim()
        body.body = loreBody
      }

      const url = isCreate ? `/api/${collection}` : `/api/${collection}/${item.id}`
      const method = isCreate ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('codex.err.generic'))
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
    <div className="modal-bg2">
      <div className="modal2" onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 92vw)' }}>
        <div className="modal2-head">
          <div>
            <div style={monoEye}>{isCreate ? t('codex.create.eye') : t('codex.amend.eye')}</div>
            <h2>
              {isCreate ? (
                t('codex.create.title', { kind: t(KIND_LABEL_KEY[tab] as any) })
              ) : (
                <>
                  {item.name || item.title} <em>{t('folio.titleEdit')}</em>
                </>
              )}
            </h2>
          </div>
          <div className="modal2-close" onClick={onClose}>✕</div>
        </div>

        <div className="modal2-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div>
              <label className="f-label">{t('portrait.label')}</label>
              <PortraitUpload
                value={portrait}
                alt={name}
                onChange={(id) => {
                  setPortraitId(id)
                  if (id == null) setPortrait(null)
                }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="f-label">{t('codex.f.name')}</label>
                <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} />
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
          </div>

          {tab === 'npcs' && (
            <>
              <div className="f-row">
                <div>
                  <label className="f-label">{t('codex.f.title')}</label>
                  <input className="f-input" value={npcTitle} onChange={(e) => setNpcTitle(e.target.value)} />
                </div>
                <div>
                  <label className="f-label">{t('codex.f.status')}</label>
                  <select className="f-input" value={npcStatus} onChange={(e) => setNpcStatus(e.target.value)}>
                    {['alive', 'missing', 'imprisoned', 'dead', 'unknown'].map((s) => (
                      <option key={s} value={s}>
                        {t(`codex.npcStatus.${s}` as any)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="f-label">{t('codex.f.currentLocationLabel')}</label>
                <input
                  className="f-input"
                  value={npcCurrentLocationLabel}
                  onChange={(e) => setNpcCurrentLocationLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="f-label">{t('codex.f.tags')}</label>
                <input className="f-input" value={npcTags} onChange={(e) => setNpcTags(e.target.value)} />
              </div>
            </>
          )}

          {tab === 'regions' && (
            <>
              <div className="f-row">
                <div>
                  <label className="f-label">{t('codex.f.area')}</label>
                  <select className="f-input" value={regionArea} onChange={(e) => setRegionArea(e.target.value)}>
                    {(['North', 'Centre', 'South', 'Islands'] as const).map((a) => (
                      <option key={a} value={a}>
                        {t(`codex.area.${a.toLowerCase()}` as any)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="f-label">{t('codex.f.kind')}</label>
                  <input className="f-input" value={regionKind} onChange={(e) => setRegionKind(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="f-label">{t('codex.f.tagline')}</label>
                <input
                  className="f-input"
                  value={regionTagline}
                  onChange={(e) => setRegionTagline(e.target.value)}
                />
              </div>
            </>
          )}

          {tab === 'locations' && (
            <div className="f-row">
              <div>
                <label className="f-label">{t('codex.f.region')}</label>
                <select className="f-input" value={locRegionId} onChange={(e) => setLocRegionId(e.target.value)}>
                  <option value="">—</option>
                  {data.regions.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="f-label">{t('codex.f.kind')}</label>
                <input className="f-input" value={locKind} onChange={(e) => setLocKind(e.target.value)} />
              </div>
            </div>
          )}

          {tab === 'factions' && (
            <div>
              <label className="f-label">{t('codex.f.tone')}</label>
              <select className="f-input" value={factionTone} onChange={(e) => setFactionTone(e.target.value)}>
                {(['Ally', 'Antagonist', 'Neutral', 'Historical', 'Mystery'] as const).map((tn) => (
                  <option key={tn} value={tn}>
                    {t(`codex.tone.${tn.toLowerCase()}` as any)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === 'items' && (
            <>
              <div className="f-row">
                <div>
                  <label className="f-label">{t('codex.f.kind')}</label>
                  <input className="f-input" value={itemKind} onChange={(e) => setItemKind(e.target.value)} />
                </div>
                <div>
                  <label className="f-label">{t('codex.f.rarity')}</label>
                  <select className="f-input" value={itemRarity} onChange={(e) => setItemRarity(e.target.value)}>
                    {[
                      ['Common', 'common'],
                      ['Uncommon', 'uncommon'],
                      ['Rare', 'rare'],
                      ['Very rare', 'veryRare'],
                      ['Legendary', 'legendary'],
                      ['Unknown', 'unknown'],
                    ].map(([value, key]) => (
                      <option key={value} value={value}>
                        {t(`codex.rarity.${key}` as any)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="f-label">{t('codex.f.ownerLabel')}</label>
                <input
                  className="f-input"
                  value={itemOwnerLabel}
                  onChange={(e) => setItemOwnerLabel(e.target.value)}
                />
              </div>
            </>
          )}

          {tab === 'lore' && (
            <>
              <div className="f-row">
                <div>
                  <label className="f-label">{t('codex.f.kind')}</label>
                  <select className="f-input" value={loreKind} onChange={(e) => setLoreKind(e.target.value)}>
                    {['general', 'cosmology', 'history', 'religion', 'magic', 'planes', 'custom', 'mystery'].map(
                      (k) => (
                        <option key={k} value={k}>
                          {t(`codex.loreKind.${k}` as any)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="f-label">{t('codex.f.era')}</label>
                  <input
                    className="f-input"
                    value={loreEra}
                    onChange={(e) => setLoreEra(e.target.value)}
                    placeholder={t('codex.f.eraPlaceholder')}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="f-label">{t('codex.f.description')}</label>
            <textarea
              className="f-textarea"
              rows={8}
              value={tab === 'lore' ? loreBody : description}
              onChange={(e) => (tab === 'lore' ? setLoreBody(e.target.value) : setDescription(e.target.value))}
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
          {!isCreate ? (
            <button className="btn3 btn3-danger" onClick={remove} disabled={busy || deleting} type="button">
              {deleting ? t('codex.btn.deleting') : t('codex.btn.delete')}
            </button>
          ) : (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '.18em',
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
              }}
            >
              {t('codex.foot')}
            </span>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onClose}>{t('folio.btn.cancel')}</button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy || deleting || !name.trim()}>
              {busy
                ? isCreate ? t('codex.btn.creating') : t('codex.btn.saving')
                : isCreate ? t('codex.btn.create') : t('codex.btn.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
