'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LinkText } from '../LinkText'
import { useTip } from '../TipContext'
import { useAuth3 } from '../AuthContext'
import { PantheonByTier } from './PantheonByTier'
import { CodexPortrait } from './CodexPortrait'
import { CodexAmendModal } from './CodexAmendModal'
import { portraitUrl } from '../portrait'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { CodexTabId, KorethData } from '../types'
import type { Region, Location, Faction, Npc, Item, Deity } from '@/payload-types'

type Item_ =
  | (Region & { __kind: 'regions' })
  | (Location & { __kind: 'locations' })
  | (Faction & { __kind: 'factions' })
  | (Npc & { __kind: 'npcs' })
  | (Item & { __kind: 'items' })

type TabDef = { id: CodexTabId; labelKey: DictKey; pluralKey: DictKey; glyph: string; hue: number }
const CODEX_TABS: TabDef[] = [
  { id: 'npcs', labelKey: 'codex.tab.npcs', pluralKey: 'codex.plural.npcs', glyph: '◐', hue: 285 },
  { id: 'regions', labelKey: 'codex.tab.regions', pluralKey: 'codex.plural.regions', glyph: '◇', hue: 200 },
  { id: 'locations', labelKey: 'codex.tab.locations', pluralKey: 'codex.plural.locations', glyph: '✦', hue: 50 },
  { id: 'factions', labelKey: 'codex.tab.factions', pluralKey: 'codex.plural.factions', glyph: '✕', hue: 25 },
  { id: 'items', labelKey: 'codex.tab.items', pluralKey: 'codex.plural.items', glyph: '◈', hue: 145 },
  { id: 'pantheon', labelKey: 'codex.tab.pantheon', pluralKey: 'codex.plural.pantheon', glyph: '☼', hue: 75 },
  { id: 'lore', labelKey: 'codex.tab.lore', pluralKey: 'codex.plural.lore', glyph: '❖', hue: 320 },
]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÀ-ÿ']/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const stableHash = (s: string) =>
  [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)

const hueOf = (item: { name: string; accentHue?: number | null }, fallbackIdx: number) =>
  item.accentHue ?? (fallbackIdx * 47) % 360

const subOf = (item: any, tab: CodexTabId): string => {
  switch (tab) {
    case 'npcs':
      return item.title || ''
    case 'regions':
      return item.kind || ''
    case 'locations':
      return typeof item.region === 'object' && item.region ? item.region.name : ''
    case 'factions':
      return item.tone || ''
    case 'items':
      return item.kind || ''
    case 'lore':
      return item.kind || ''
    default:
      return ''
  }
}

const metaOf = (item: any, tab: CodexTabId): string => {
  switch (tab) {
    case 'regions':
      return item.area || ''
    case 'items':
      return item.rarity || ''
    case 'factions':
      return item.tone || ''
    case 'lore':
      return item.era || ''
    default:
      return ''
  }
}

export const Codex: React.FC<{ data: KorethData }> = ({ data }) => {
  const { t } = useT()
  const auth = useAuth3()
  const router = useRouter()
  const [tab, setTab] = useState<CodexTabId>('npcs')
  const [q, setQ] = useState('')
  // Store only the selected id per tab — re-deriving the item from the live
  // list on every render means edits flow in as soon as router.refresh()
  // resolves, instead of the detail view staying frozen on a stale snapshot.
  const [selIdByTab, setSelIdByTab] = useState<Record<string, number>>({})
  const [createOpen, setCreateOpen] = useState(false)

  const tabDef = CODEX_TABS.find((td) => td.id === tab)!

  const list: any[] =
    tab === 'npcs' ? data.npcs :
    tab === 'regions' ? data.regions :
    tab === 'locations' ? data.locations :
    tab === 'factions' ? data.factions :
    tab === 'items' ? data.items :
    tab === 'lore' ? data.lore :
    []

  const counts: Record<CodexTabId, number> = {
    npcs: data.npcs.length,
    regions: data.regions.length,
    locations: data.locations.length,
    factions: data.factions.length,
    items: data.items.length,
    pantheon: data.pantheon.length,
    lore: data.lore.length,
  }

  const filtered = useMemo(() => {
    if (!q || tab === 'pantheon') return list
    const Q = q.toLowerCase()
    return list.filter((it) => JSON.stringify(it).toLowerCase().includes(Q))
  }, [q, list, tab])

  const selId = selIdByTab[tab]
  const sel = (selId != null ? list.find((it: any) => it.id === selId) : null) || filtered[0]
  const setSel = (item: any) => setSelIdByTab({ ...selIdByTab, [tab]: item.id as number })

  const Tabs = (
    <div className="codex2-kinds" role="tablist">
      {CODEX_TABS.map((td) => (
        <button
          key={td.id}
          className={'k-card' + (td.id === tab ? ' active' : '')}
          onClick={() => {
            setTab(td.id)
            setQ('')
          }}
          style={{ ['--k-hue' as string]: td.hue } as React.CSSProperties}
        >
          <span className="k-glyph">{td.glyph}</span>
          <span className="k-text">
            <span className="k-label">{t(td.labelKey)}</span>
            <span className="k-plural">{t(td.pluralKey)}</span>
          </span>
          <span className="k-count">{counts[td.id]}</span>
        </button>
      ))}
    </div>
  )

  if (tab === 'pantheon') {
    return (
      <div className="codex2">
        <div className="codex2-top">
          <div className="codex2-head">
            <div className="eye">{t('codex.eyebrow')}</div>
            <h2>
              {t('codex.headline.a')} <em>{t('codex.headline.b')}</em>
            </h2>
          </div>
          {Tabs}
        </div>
        <PantheonByTier pantheon={data.pantheon} />
      </div>
    )
  }

  return (
    <div className="codex2">
      <div className="codex2-top">
        <div className="codex2-head">
          <div className="eye">{t('codex.eyebrow')}</div>
          <h2>
            {t('codex.headline.a')} <em>{t('codex.headline.b')}</em>
          </h2>
        </div>
        {Tabs}
      </div>

      <div className="codex2-body">
        <div className="codex2-list" style={{ ['--k-hue' as string]: tabDef.hue } as React.CSSProperties}>
          <div className="codex2-search">
            <span className="cs-glyph">{tabDef.glyph}</span>
            <input
              placeholder={t('codex.search.placeholder', { what: t(tabDef.labelKey).toLowerCase() })}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="cs-count">
              {filtered.length} / {list.length}
            </span>
            {q && (
              <span onClick={() => setQ('')} className="cs-clear">
                clear
              </span>
            )}
          </div>

          {auth.canEditAny && (
            <button className="codex-new" onClick={() => setCreateOpen(true)} type="button">
              {t('codex.new', { kind: t(tabDef.labelKey).toLowerCase() })}
            </button>
          )}

          <div className="codex-rows">
            {filtered.length === 0 && <div className="codex-empty">{t('codex.empty', { q })}</div>}
            {filtered.map((it: any, i: number) => {
              const id = it.id ?? it.name
              const isActive = sel && (sel.id ?? sel.name) === id
              const sub = subOf(it, tab)
              const meta = metaOf(it, tab)
              const hue = hueOf(it, i)
              const bg = `linear-gradient(135deg, oklch(0.42 0.16 ${hue}), oklch(0.18 0.06 ${(hue + 60) % 360}))`
              return (
                <div
                  key={id}
                  className={'codex-row' + (isActive ? ' active' : '')}
                  onClick={() => setSel(it)}
                >
                  <div className="ico" style={{ background: bg, color: 'white' }}>
                    {initials(it.name)}
                  </div>
                  <div>
                    <div className="nm">{it.name}</div>
                    {sub && <div className="sub">{sub}</div>}
                  </div>
                  {meta && <div className="meta">{meta}</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="codex-detail" key={(sel?.id ?? sel?.name) + tab}>
          {sel && (
            <CodexDetail
              item={sel}
              tab={tab}
              data={data}
              onDeleted={() => {
                setSelIdByTab((s) => {
                  const next = { ...s }
                  delete next[tab]
                  return next
                })
              }}
            />
          )}
        </div>
      </div>

      {createOpen && (
        <CodexAmendModal
          tab={tab}
          data={data}
          onClose={() => setCreateOpen(false)}
          onSubmitted={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

const EYEBROW_KEY: Record<CodexTabId, DictKey> = {
  npcs: 'codex.eyebrowFor.npcs',
  regions: 'codex.eyebrowFor.regions',
  locations: 'codex.eyebrowFor.locations',
  factions: 'codex.eyebrowFor.factions',
  items: 'codex.eyebrowFor.items',
  pantheon: 'codex.eyebrowFor.entry',
  lore: 'codex.eyebrowFor.lore',
}

const CodexDetail: React.FC<{
  item: any
  tab: CodexTabId
  data: KorethData
  onDeleted?: () => void
}> = ({ item, tab, data, onDeleted }) => {
  const auth = useAuth3()
  const router = useRouter()
  const { t } = useT()
  const { show, hide, index } = useTip()
  const [amendOpen, setAmendOpen] = useState(false)

  const hue = item.accentHue ?? stableHash(item.name) % 360
  const bg = `linear-gradient(135deg, oklch(0.45 0.18 ${hue}), oklch(0.16 0.06 ${(hue + 60) % 360}))`

  const subtitle =
    item.title || item.tagline || (typeof item.region === 'object' ? item.region?.name : '') || item.kind || ''

  // Lore stores its prose in `body` (textarea, not richText).
  const bodyText: string =
    lexicalText(item.bio) || lexicalText(item.description) || (typeof item.body === 'string' ? item.body : '')

  const kv: [string, string][] = []
  if (tab === 'npcs') {
    if (item.currentLocationLabel) kv.push([t('codex.kv.lastSeen'), item.currentLocationLabel])
    else if (typeof item.currentLocation === 'object' && item.currentLocation)
      kv.push([t('codex.kv.lastSeen'), item.currentLocation.name])
    if (Array.isArray(item.tags) && item.tags.length)
      kv.push([t('codex.kv.tags'), item.tags.map((tg: any) => tg.tag).join(' · ')])
  } else if (tab === 'regions') {
    if (item.area) kv.push([t('codex.kv.area'), item.area])
    if (item.kind) kv.push([t('codex.kv.type'), item.kind])
  } else if (tab === 'locations') {
    if (typeof item.region === 'object' && item.region) kv.push([t('codex.kv.region'), item.region.name])
    if (item.kind) kv.push([t('codex.kv.type'), item.kind])
  } else if (tab === 'factions') {
    if (item.tone) kv.push([t('codex.kv.disposition'), item.tone])
  } else if (tab === 'items') {
    if (item.kind) kv.push([t('codex.kv.kind'), item.kind])
    if (item.rarity) kv.push([t('codex.kv.rarity'), item.rarity])
    if (item.ownerLabel) kv.push([t('codex.kv.bearer'), item.ownerLabel])
  } else if (tab === 'lore') {
    if (item.kind) kv.push([t('codex.kv.kind'), item.kind])
    if (item.era) kv.push([t('codex.kv.era'), item.era])
  }

  const related: { name: string; kind: string }[] = []
  for (const [name, ent] of Object.entries(index)) {
    if (name === item.name) continue
    if (related.length >= 8) break
    if (bodyText.includes(name)) related.push({ name, kind: ent.kind })
  }

  return (
    <>
      <div className="cd-hero" style={{ ['--cd-bg' as string]: bg, background: bg } as React.CSSProperties}>
        <div className="cd-portrait">
          {portraitUrl(item.portrait) ? (
            <img className="cd-portrait-image" src={portraitUrl(item.portrait)!} alt={item.name} />
          ) : (
            <CodexPortrait name={item.name} hue={hue} kind={tab} symbol={item.symbol} />
          )}
        </div>
        <div className="cd-hero-text">
          <div className="cd-hero-eye">{t(EYEBROW_KEY[tab])}</div>
          <h1>{item.name}</h1>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
        {auth?.canEditAny && tab !== 'pantheon' && (
          <div
            className="cd-amend"
            title={t('codex.amend.title')}
            onClick={() => setAmendOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            ✎ {t('codex.amend')}
          </div>
        )}
      </div>

      <div className="cd-body">
        {(item.tags || item.tone || item.rarity) && (
          <div className="cd-tags">
            {item.tone && <span className="cd-tag accent">{item.tone}</span>}
            {Array.isArray(item.tags) && item.tags.map((t: any) => <span key={t.tag} className="cd-tag">{t.tag}</span>)}
            {item.rarity && <span className="cd-tag accent">{item.rarity}</span>}
          </div>
        )}

        {bodyText && (
          <div className="cd-prose">
            {bodyText.split(/\n\n+/).map((p, i) => (
              <p key={i}>
                <LinkText text={p} />
              </p>
            ))}
          </div>
        )}

        {kv.length > 0 && (
          <div className="cd-grid">
            {kv.map(([k, v]) => (
              <div key={k} className="cd-kv">
                <div className="k">{k}</div>
                <div className="v">
                  <LinkText text={v} />
                </div>
              </div>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="cd-section">
            <div className="ttl">{t('codex.connections')}</div>
            <div className="cd-related">
              {related.map((r) => (
                <div
                  key={r.name}
                  className="cd-related-row"
                  onMouseEnter={(e) => show(r.name, e.currentTarget)}
                  onMouseLeave={hide}
                >
                  <span className="nm">{r.name}</span>
                  <span className="ki">{r.kind}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {amendOpen && tab !== 'pantheon' && (
        <CodexAmendModal
          item={item}
          tab={tab}
          data={data}
          onClose={() => setAmendOpen(false)}
          onSubmitted={() => {
            setAmendOpen(false)
            router.refresh()
          }}
          onDeleted={() => {
            setAmendOpen(false)
            onDeleted?.()
            router.refresh()
          }}
        />
      )}
    </>
  )
}

const lexicalText = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: { children?: any[] } }).root
  if (!root) return ''
  const out: string[] = []
  const walk = (n: any) => {
    if (!n) return
    if (n.type === 'text' && typeof n.text === 'string') {
      out.push(n.text)
    }
    if (Array.isArray(n.children)) {
      for (const c of n.children) walk(c)
      // paragraphs separated by blank lines for nice prose splitting later
      if (n.type === 'paragraph') out.push('\n\n')
    }
  }
  for (const c of root.children || []) walk(c)
  return out.join('').trim()
}
