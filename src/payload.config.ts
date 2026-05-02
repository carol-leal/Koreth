import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { Events } from './collections/Events'
import { Lore } from './collections/Lore'
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
    Events,
    Lore,
  ],
  globals: [Campaign],
  plugins: [
    // Uploads land in Vercel Blob; on serverless the local /var/task FS is
    // read-only so the default disk-write upload path doesn't work.
    // BLOB_READ_WRITE_TOKEN is auto-injected by Vercel when a Blob store is
    // connected to the project; for local dev set it via `vercel env pull`.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
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
