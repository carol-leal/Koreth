import { getPayload } from 'payload'
import config from '@payload-config'
import { KorethApp } from '@/components/koreth/KorethApp'
import { getOptionalUser } from '@/utilities/getOptionalUser'
import { getCachedEntityIndex } from '@/utilities/getEntityIndex'
import type { Character, Session as SessionDoc } from '@/payload-types'
import type { SessionUser } from '@/components/koreth/AuthContext'

export default async function Home() {
  const payload = await getPayload({ config })
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
    user,
    entities,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'campaign', depth: 1 }),
    payload.find({ collection: 'regions', limit: 200, depth: 0, sort: 'name' }),
    payload.find({ collection: 'locations', limit: 200, depth: 1, sort: 'name' }),
    payload.find({ collection: 'factions', limit: 200, depth: 1, sort: 'name' }),
    payload.find({ collection: 'npcs', limit: 200, depth: 1, sort: 'name' }),
    payload.find({ collection: 'items', limit: 200, depth: 1, sort: 'name' }),
    payload.find({ collection: 'deities', limit: 200, depth: 0, sort: 'name' }),
    payload.find({ collection: 'characters', limit: 50, depth: 2, sort: 'name' }),
    payload.find({ collection: 'sessions', limit: 100, depth: 1, sort: '-number' }),
    payload.find({ collection: 'quests', limit: 200, depth: 0 }),
    payload.find({ collection: 'leads', limit: 200, depth: 1, sort: '-updatedAt' }),
    getOptionalUser(),
    getCachedEntityIndex(),
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
      }}
      user={sessionUser}
      entities={entities}
    />
  )
}
