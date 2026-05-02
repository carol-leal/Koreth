import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Pantheon: CollectionConfig = {
  slug: 'deities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'domain', 'status'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/pantheon/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/pantheon/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: ['Primordial', 'Greater', 'Lesser', 'Dark'].map((v) => ({ label: v, value: v })),
    },
    { name: 'domain', type: 'text' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'alive',
      options: ['withdrawn', 'silent', 'alive', 'rising', 'exiled', 'dead'].map((v) => ({ label: v, value: v })),
    },
    { name: 'lastSeen', type: 'text' },
    { name: 'lastSeenLocation', type: 'relationship', relationTo: 'locations' },
    { name: 'symbol', type: 'text' },
    { name: 'alignment', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'accentHue', type: 'number', min: 0, max: 360 },
    ...slugField('name'),
  ],
}
