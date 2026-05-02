import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { lexicalToPlainText } from './lexicalToPlainText'
import { DEFAULT_LOCALE, type Locale } from '@/i18n'

export type EntityKind =
  | 'npc'
  | 'character'
  | 'location'
  | 'region'
  | 'faction'
  | 'item'
  | 'deity'

export type EntityIndexEntry = {
  name: string
  kind: EntityKind
  slug: string
  summary: string
  accentHue?: number
}

const summarise = (raw: unknown, fallback?: string): string => {
  const t = lexicalToPlainText(raw, { firstParagraphOnly: true })
  if (t.length > 0) return t.length > 280 ? t.slice(0, 277) + '…' : t
  return (fallback || '').slice(0, 280)
}

const buildIndex = async (locale: Locale): Promise<EntityIndexEntry[]> => {
  const payload = await getPayload({ config })
  const limit = 500
  const opts = { limit, depth: 0, locale, fallbackLocale: DEFAULT_LOCALE } as const
  const [npcs, characters, locations, regions, factions, items, deities] = await Promise.all([
    payload.find({ collection: 'npcs', ...opts }),
    payload.find({ collection: 'characters', ...opts }),
    payload.find({ collection: 'locations', ...opts }),
    payload.find({ collection: 'regions', ...opts }),
    payload.find({ collection: 'factions', ...opts }),
    payload.find({ collection: 'items', ...opts }),
    payload.find({ collection: 'deities', ...opts }),
  ])

  const out: EntityIndexEntry[] = []
  for (const n of npcs.docs) out.push({ name: n.name, kind: 'npc', slug: n.slug || '', summary: summarise(n.bio, n.title || ''), accentHue: n.accentHue ?? undefined })
  for (const c of characters.docs) out.push({ name: c.name, kind: 'character', slug: c.slug || '', summary: summarise(c.backstory, `${c.race ?? ''} ${c.class}`.trim()), accentHue: c.accentHue ?? undefined })
  for (const l of locations.docs) out.push({ name: l.name, kind: 'location', slug: l.slug || '', summary: summarise(l.description, l.kind), accentHue: l.accentHue ?? undefined })
  for (const r of regions.docs) out.push({ name: r.name, kind: 'region', slug: r.slug || '', summary: summarise(r.description, r.tagline || ''), accentHue: r.accentHue ?? undefined })
  for (const f of factions.docs) out.push({ name: f.name, kind: 'faction', slug: f.slug || '', summary: summarise(f.description, ''), accentHue: f.accentHue ?? undefined })
  for (const i of items.docs) out.push({ name: i.name, kind: 'item', slug: i.slug || '', summary: summarise(i.description, [i.kind, i.rarity].filter(Boolean).join(' · ')) })
  for (const d of deities.docs) out.push({ name: d.name, kind: 'deity', slug: d.slug || '', summary: summarise(d.description, d.domain || ''), accentHue: d.accentHue ?? undefined })

  // Dedupe by name (last wins) and sort longest-first for safe regex matching.
  const map = new Map<string, EntityIndexEntry>()
  for (const e of out) if (e.name) map.set(e.name, e)
  return [...map.values()].sort((a, b) => b.name.length - a.name.length)
}

const cachedByLocale = (locale: Locale) =>
  unstable_cache(() => buildIndex(locale), ['koreth-entities', locale], {
    tags: ['koreth-entities'],
    revalidate: 3600,
  })

export const getCachedEntityIndex = (locale: Locale) => cachedByLocale(locale)()
