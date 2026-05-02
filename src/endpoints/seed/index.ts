import type { Payload, PayloadRequest } from 'payload'
import { DATA } from './data'

const para = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: text
      .split(/\n\n+/)
      .filter(Boolean)
      .map((p) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [
          { type: 'text', version: 1, text: p, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
      })),
  },
})

type IdMap = Record<string, number | string>

export const seed = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('Seeding Koreth…')

  // 0. Wipe existing rows for idempotent reseeds.
  for (const slug of [
    'events',
    'leads',
    'quests',
    'sessions',
    'characters',
    'deities',
    'items',
    'npcs',
    'factions',
    'locations',
    'regions',
    'users',
  ] as const) {
    try {
      const docs = await payload.find({ collection: slug, limit: 1000 })
      for (const d of docs.docs) {
        await payload.delete({
          collection: slug,
          id: d.id,
          req,
          context: { disableRevalidate: true },
        })
      }
    } catch (e) {
      payload.logger.warn(`Could not clear ${slug}: ${(e as Error).message}`)
    }
  }

  // 1. Regions
  const regionId: IdMap = {}
  for (const r of DATA.regions) {
    const doc = await payload.create({
      collection: 'regions',
      req,
      data: {
        name: r.name,
        slug: r.id,
        area: r.area as 'North' | 'Centre' | 'South' | 'Islands',
        kind: r.kind,
        tagline: r.tagline,
        description: para(r.desc),
        mapPosition: { x: r.x, y: r.y },
        accentHue: 285,
      },
      context: { disableRevalidate: true },
    })
    regionId[r.id] = doc.id
  }

  // 2. Locations
  const locationId: IdMap = {}
  for (const l of DATA.locations) {
    const regionDoc = DATA.regions.find((r) => r.name === l.region)
    const regionRef = regionDoc ? regionId[regionDoc.id] : undefined
    if (!regionRef) {
      payload.logger.warn(`Location ${l.id} missing region "${l.region}"`)
      continue
    }
    const doc = await payload.create({
      collection: 'locations',
      req,
      data: {
        name: l.name,
        slug: l.id,
        region: regionRef as number,
        kind: l.kind,
        description: para(l.desc),
        mapPosition: { x: l.x, y: l.y },
      },
      context: { disableRevalidate: true },
    })
    locationId[l.id] = doc.id
  }

  // 3. Factions
  const factionId: IdMap = {}
  for (const f of DATA.factions) {
    const doc = await payload.create({
      collection: 'factions',
      req,
      data: {
        name: f.name,
        slug: f.id,
        tone: f.tone as 'Ally' | 'Antagonist' | 'Neutral' | 'Historical' | 'Mystery',
        description: para(f.desc),
      },
      context: { disableRevalidate: true },
    })
    factionId[f.id] = doc.id
  }

  // 4. NPCs
  const npcId: IdMap = {}
  for (const n of DATA.npcs) {
    const factions: number[] = []
    const regions: number[] = []
    for (const rel of n.relations || []) {
      if (factionId[rel] != null) factions.push(factionId[rel] as number)
      if (regionId[rel] != null) regions.push(regionId[rel] as number)
    }
    const doc = await payload.create({
      collection: 'npcs',
      req,
      data: {
        name: n.name,
        slug: n.id,
        title: n.title,
        tags: (n.tags || []).map((t) => ({ tag: t })),
        bio: para(n.bio),
        currentLocationLabel: n.location,
        factions,
        regions,
        accentHue: n.hue,
        status: 'alive',
      },
      context: { disableRevalidate: true },
    })
    npcId[n.id] = doc.id
  }

  // 5. Items (owners later — characters first need to exist)
  const itemId: IdMap = {}
  for (const it of DATA.items) {
    const doc = await payload.create({
      collection: 'items',
      req,
      data: {
        name: it.name,
        slug: it.id,
        kind: it.kind,
        rarity: it.rarity as 'Common' | 'Uncommon' | 'Rare' | 'Very rare' | 'Legendary' | 'Unknown',
        description: para(it.desc),
        ownerLabel: it.owner,
      },
      context: { disableRevalidate: true },
    })
    itemId[it.id] = doc.id
  }

  // 7. Pantheon
  for (const g of DATA.pantheon) {
    const slug = g.name
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    await payload.create({
      collection: 'deities',
      req,
      data: {
        name: g.name,
        slug,
        tier: g.tier as 'Primordial' | 'Greater' | 'Lesser' | 'Dark',
        domain: g.domain,
        status: g.status as 'withdrawn' | 'silent' | 'alive' | 'rising' | 'exiled' | 'dead',
        lastSeen: g.lastSeen,
        symbol: g.symbol,
        alignment: g.alignment,
      },
      context: { disableRevalidate: true },
    })
  }

  // 8. Users (admin Nora + 4 players)
  const userId: Record<string, number> = {}
  const accounts = [
    { email: 'nora@koreth.tale', name: 'Nora', role: 'admin' as const, pcIdHint: undefined },
    { email: 'dani@koreth.tale', name: 'Dani', role: 'player' as const, pcIdHint: 'ashryn' },
    { email: 'mateo@koreth.tale', name: 'Mateo', role: 'player' as const, pcIdHint: 'halren' },
    { email: 'priya@koreth.tale', name: 'Priya', role: 'player' as const, pcIdHint: 'veska' },
    { email: 'sam@koreth.tale', name: 'Sam', role: 'player' as const, pcIdHint: 'drevan' },
  ]
  for (const a of accounts) {
    const doc = await payload.create({
      collection: 'users',
      req,
      data: { email: a.email, name: a.name, role: a.role, password: 'koreth' },
      context: { disableRevalidate: true },
    })
    userId[a.email] = doc.id
  }

  // 9. Characters (link to users)
  const characterId: IdMap = {}
  for (const c of DATA.characters) {
    const playerEmail = accounts.find((a) => a.pcIdHint === c.id)?.email
    const playerRef = playerEmail ? userId[playerEmail] : undefined
    const doc = await payload.create({
      collection: 'characters',
      req,
      data: {
        name: c.name,
        slug: c.id,
        player: playerRef,
        playerLabel: c.player,
        class: c.class,
        level: c.level,
        race: c.race,
        vitals: { hpCurrent: c.hp.cur, hpMax: c.hp.max, ac: c.ac },
        stats: c.stats,
        accentHue: c.hue,
        backstory: para(c.backstory),
        gear: c.gear.map((g) => ({ name: g })),
      },
      context: { disableRevalidate: true },
    })
    characterId[c.id] = doc.id
    if (playerRef) {
      await payload.update({
        collection: 'users',
        id: playerRef,
        req,
        data: { pc: doc.id },
        context: { disableRevalidate: true },
      })
    }
  }

  // 10. Backfill items.ownerCharacter where the V3 owner string matches a PC
  for (const it of DATA.items) {
    const matchChar = DATA.characters.find((c) => c.name === it.owner)
    if (matchChar && characterId[matchChar.id]) {
      await payload.update({
        collection: 'items',
        id: itemId[it.id] as number,
        req,
        data: { ownerCharacter: characterId[matchChar.id] as number },
        context: { disableRevalidate: true },
      })
    }
  }

  // 11. Sessions — only PCs (or the DM) can author folios; Mirenne is an
  //     NPC so V3's "Mirenne the Unsung" entries are reattributed to Veska Tho
  //     (Priya), the party bard.
  const sessionAuthorOverride: Record<string, { account: string; label: string }> = {
    s14: { account: 'priya@koreth.tale', label: 'Veska Tho' },
    s13: { account: 'priya@koreth.tale', label: 'Veska Tho' },
  }
  const sessionId: IdMap = {}
  for (const s of DATA.sessions) {
    const override = sessionAuthorOverride[s.id]
    const account =
      (override && accounts.find((a) => a.email === override.account)) ||
      accounts.find((a) => a.name === s.author) ||
      accounts[0]
    const authorRef = userId[account.email]
    const authorLabel = override?.label ?? s.author
    const doc = await payload.create({
      collection: 'sessions',
      req,
      data: {
        title: s.title,
        slug: s.id,
        number: s.n,
        inWorldDate: s.date,
        author: authorRef,
        authorLabel,
        excerpt: s.excerpt,
        body: para(s.excerpt),
      },
      context: { disableRevalidate: true },
    })
    sessionId[s.id] = doc.id
  }

  // 12. Quests
  for (const q of DATA.quests) {
    await payload.create({
      collection: 'quests',
      req,
      data: {
        title: q.title,
        slug: q.id,
        status: q.status as 'active' | 'open' | 'complete',
        priority: q.priority as 'main' | 'side' | 'mystery',
        summary: q.summary,
        steps: q.steps.map((t) => ({ text: t, done: false })),
      },
      context: { disableRevalidate: true },
    })
  }

  // 13. Campaign global — only fields that exist in D.campaign from data.js.
  await payload.updateGlobal({
    slug: 'campaign',
    req,
    data: {
      name: DATA.campaign.name,
      tagline: DATA.campaign.tagline,
      tagSource: DATA.campaign.source,
      summary: para(DATA.campaign.summary),
      currentSession: DATA.campaign.session,
      partyName: DATA.campaign.party,
      partyLevel: DATA.campaign.partyLevel,
      partyXp: DATA.campaign.partyXP,
      nextLevelXp: DATA.campaign.nextLevelXP,
    },
    context: { disableRevalidate: true },
  })

  payload.logger.info('Koreth seed complete.')
}
