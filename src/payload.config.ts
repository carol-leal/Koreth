import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Regions } from './collections/Regions'
import { Locations } from './collections/Locations'
import { Factions } from './collections/Factions'
import { Npcs } from './collections/Npcs'
import { Items } from './collections/Items'
import { Pantheon } from './collections/Pantheon'
import { Characters } from './collections/Characters'
import { Sessions } from './collections/Sessions'
import { Quests } from './collections/Quests'
import { Leads } from './collections/Leads'
import { Campaign } from './globals/Campaign'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    user: Users.slug,
  },
  localization: {
    locales: [
      { code: 'es', label: 'Español' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'es',
    fallback: true,
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
      max: 5,
      idleTimeoutMillis: 30_000,
    },
  }),
  collections: [
    Media,
    Users,
    Regions,
    Locations,
    Factions,
    Npcs,
    Items,
    Pantheon,
    Characters,
    Sessions,
    Quests,
    Leads,
  ],
  globals: [Campaign],
  cors: [getServerSideURL()].filter(Boolean),
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
