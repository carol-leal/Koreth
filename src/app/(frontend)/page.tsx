import { getPayload } from 'payload'
import config from '@payload-config'
import { KorethApp } from '@/components/koreth/KorethApp'
import { getOptionalUser } from '@/utilities/getOptionalUser'
import { getCachedEntityIndex } from '@/utilities/getEntityIndex'
import { getServerLocale } from '@/i18n/getServerLocale'
import { DEFAULT_LOCALE } from '@/i18n'
import type { Character, Session as SessionDoc } from '@/payload-types'
import type { SessionUser } from '@/components/koreth/AuthContext'

export default async function Home() {
  const payload = await getPayload({ config })
  const locale = await getServerLocale()
  const [
    campaign,
    regions,
    locations,
    factions,
    npcs,
    items,
    pantheon,
    characters,
    sessions,
    quests,
    leads,
    events,
    lore,
    user,
    entities,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'campaign', depth: 1, locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'regions', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'locations', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'factions', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'npcs', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'items', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'deities', limit: 200, depth: 1, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'characters', limit: 50, depth: 2, sort: 'name', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'sessions', limit: 100, depth: 1, sort: '-number', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'quests', limit: 200, depth: 0, locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'leads', limit: 200, depth: 1, sort: '-updatedAt', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'events', limit: 500, depth: 1, sort: 'sortOrder', locale, fallbackLocale: DEFAULT_LOCALE }),
    payload.find({ collection: 'lore', limit: 500, depth: 1, sort: 'title', locale, fallbackLocale: DEFAULT_LOCALE }),
    getOptionalUser(),
    getCachedEntityIndex(locale),
  ])

  const sessionUser: SessionUser = user
    ? {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        pcSlug: typeof user.pc === 'object' && user.pc ? user.pc.slug ?? null : null,
      }
    : null

  return (
    <KorethApp
      data={{
        campaign,
        regions: regions.docs,
        locations: locations.docs,
        factions: factions.docs,
        npcs: npcs.docs,
        items: items.docs,
        pantheon: pantheon.docs,
        characters: characters.docs as Character[],
        sessions: sessions.docs as SessionDoc[],
        quests: quests.docs,
        leads: leads.docs,
        events: events.docs,
        lore: lore.docs,
      }}
      user={sessionUser}
      entities={entities}
    />
  )
}
