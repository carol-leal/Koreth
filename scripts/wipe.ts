import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CONTENT_COLLECTIONS = [
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
] as const

const main = async () => {
  const payload = await getPayload({ config })

  for (const slug of CONTENT_COLLECTIONS) {
    try {
      const docs = await payload.find({ collection: slug, limit: 1000 })
      for (const d of docs.docs) {
        await payload.delete({ collection: slug, id: d.id, context: { disableRevalidate: true } })
      }
      // eslint-disable-next-line no-console
      console.log(`  wiped ${slug} (${docs.docs.length})`)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`  could not wipe ${slug}: ${(e as Error).message}`)
    }
  }

  try {
    await payload.updateGlobal({
      slug: 'campaign',
      data: {
        name: 'Koreth',
        tagline: null,
        tagSource: null,
        summary: null,
        currentSession: null,
        partyName: null,
        partyLevel: null,
        partyXp: null,
        nextLevelXp: null,
      },
      context: { disableRevalidate: true },
    })
    // eslint-disable-next-line no-console
    console.log('  reset campaign global')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`  could not reset campaign global: ${(e as Error).message}`)
  }

  // eslint-disable-next-line no-console
  console.log('\nDatabase wiped. Users and media uploads preserved.')
  process.exit(0)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
