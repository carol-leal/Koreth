'use client'

import React, { useMemo, useState } from 'react'
import { LinkText } from '../LinkText'
import { useTip } from '../TipContext'
import { useAuth3 } from '../AuthContext'
import { PantheonByTier } from './PantheonByTier'
import { CodexPortrait } from './CodexPortrait'
import type { CodexTabId, KorethData } from '../types'
import type { Region, Location, Faction, Npc, Item, Deity } from '@/payload-types'

type Item_ =
  | (Region & { __kind: 'regions' })
  | (Location & { __kind: 'locations' })
  | (Faction & { __kind: 'factions' })
  | (Npc & { __kind: 'npcs' })
  | (Item & { __kind: 'items' })

type TabDef = { id: CodexTabId; label: string; plural: string; glyph: string; hue: number }
const CODEX_TABS: TabDef[] = [
  { id: 'npcs', label: 'NPCs', plural: 'non-player characters', glyph: '◐', hue: 285 },
  { id: 'regions', label: 'Regions', plural: 'lands of Korêth', glyph: '◇', hue: 200 },
  { id: 'locations', label: 'Places', plural: 'cities, ruins, hideouts', glyph: '✦', hue: 50 },
  { id: 'factions', label: 'Factions', plural: 'orders & cabals', glyph: '✕', hue: 25 },
  { id: 'items', label: 'Items', plural: 'weapons & relics', glyph: '◈', hue: 145 },
  { id: 'pantheon', label: 'Pantheon', plural: 'the gods, by tier', glyph: '☼', hue: 75 },
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
    default:
      return ''
  }
}

export const Codex: React.FC<{ data: KorethData }> = ({ data }) => {
  const [tab, setTab] = useState<CodexTabId>('npcs')
  const [q, setQ] = useState('')
  const [selByTab, setSelByTab] = useState<Record<string, any>>({})

  const tabDef = CODEX_TABS.find((t) => t.id === tab)!

  const list: any[] =
    tab === 'npcs' ? data.npcs :
    tab === 'regions' ? data.regions :
    tab === 'locations' ? data.locations :
    tab === 'factions' ? data.factions :
    tab === 'items' ? data.items :
    []

  const counts: Record<CodexTabId, number> = {
    npcs: data.npcs.length,
    regions: data.regions.length,
    locations: data.locations.length,
    factions: data.factions.length,
    items: data.items.length,
    pantheon: data.pantheon.length,
  }

  const filtered = useMemo(() => {
    if (!q || tab === 'pantheon') return list
    const Q = q.toLowerCase()
    return list.filter((it) => JSON.stringify(it).toLowerCase().includes(Q))
  }, [q, list, tab])

  const sel = selByTab[tab] || filtered[0]
  const setSel = (item: any) => setSelByTab({ ...selByTab, [tab]: item })

  const Tabs = (
    <div className="codex2-kinds" role="tablist">
      {CODEX_TABS.map((t) => (
        <button
          key={t.id}
          className={'k-card' + (t.id === tab ? ' active' : '')}
          onClick={() => {
            setTab(t.id)
            setQ('')
          }}
          style={{ ['--k-hue' as string]: t.hue } as React.CSSProperties}
        >
          <span className="k-glyph">{t.glyph}</span>
          <span className="k-text">
            <span className="k-label">{t.label}</span>
            <span className="k-plural">{t.plural}</span>
          </span>
          <span className="k-count">{counts[t.id]}</span>
        </button>
      ))}
    </div>
  )

  if (tab === 'pantheon') {
    return (
      <div className="codex2">
        <div className="codex2-top">
          <div className="codex2-head">
            <div className="eye">Act II · Codex</div>
            <h2>
              The world, <em>indexed.</em>
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
          <div className="eye">Act II · Codex</div>
          <h2>
            The world, <em>indexed.</em>
          </h2>
        </div>
        {Tabs}
      </div>

      <div className="codex2-body">
        <div className="codex2-list" style={{ ['--k-hue' as string]: tabDef.hue } as React.CSSProperties}>
          <div className="codex2-search">
            <span className="cs-glyph">{tabDef.glyph}</span>
            <input
              placeholder={`Search ${tabDef.label.toLowerCase()}…`}
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

          <div className="codex-rows">
            {filtered.length === 0 && <div className="codex-empty">No entries match “{q}”.</div>}
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
          {sel && <CodexDetail item={sel} tab={tab} data={data} />}
        </div>
      </div>
    </div>
  )
}

const eyebrowFor = (tab: CodexTabId): string => {
  switch (tab) {
    case 'npcs':
      return 'non-player character'
    case 'regions':
      return 'region of Koreth'
    case 'locations':
      return 'place'
    case 'factions':
      return 'faction'
    case 'items':
      return 'item'
    default:
      return 'entry'
  }
}

const CodexDetail: React.FC<{ item: any; tab: CodexTabId; data: KorethData }> = ({ item, tab, data }) => {
  const auth = useAuth3()
  const { show, hide, index } = useTip()

  const hue = item.accentHue ?? stableHash(item.name) % 360
  const bg = `linear-gradient(135deg, oklch(0.45 0.18 ${hue}), oklch(0.16 0.06 ${(hue + 60) % 360}))`

  const subtitle =
    item.title || item.tagline || (typeof item.region === 'object' ? item.region?.name : '') || item.kind || ''

  const bodyText = lexicalText(item.bio) || lexicalText(item.description) || ''

  const kv: [string, string][] = []
  if (tab === 'npcs') {
    if (item.currentLocationLabel) kv.push(['Last seen', item.currentLocationLabel])
    else if (typeof item.currentLocation === 'object' && item.currentLocation)
      kv.push(['Last seen', item.currentLocation.name])
    if (Array.isArray(item.tags) && item.tags.length)
      kv.push(['Tags', item.tags.map((t: any) => t.tag).join(' · ')])
  } else if (tab === 'regions') {
    if (item.area) kv.push(['Area', item.area])
    if (item.kind) kv.push(['Type', item.kind])
  } else if (tab === 'locations') {
    if (typeof item.region === 'object' && item.region) kv.push(['Region', item.region.name])
    if (item.kind) kv.push(['Type', item.kind])
  } else if (tab === 'factions') {
    if (item.tone) kv.push(['Disposition', item.tone])
  } else if (tab === 'items') {
    if (item.kind) kv.push(['Kind', item.kind])
    if (item.rarity) kv.push(['Rarity', item.rarity])
    if (item.ownerLabel) kv.push(['Bearer', item.ownerLabel])
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
          <CodexPortrait name={item.name} hue={hue} kind={tab} symbol={item.symbol} />
        </div>
        <div className="cd-hero-text">
          <div className="cd-hero-eye">{eyebrowFor(tab)}</div>
          <h1>{item.name}</h1>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
        {auth?.canEditAny && <div className="cd-amend" title="Chronicler may amend this entry">✎ amend entry</div>}
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
            <div className="ttl">Connections</div>
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
