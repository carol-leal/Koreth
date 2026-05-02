import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Npcs: CollectionConfig = {
  slug: 'npcs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'status'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/npcs/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/npcs/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    { name: 'bio', type: 'richText' },
    { name: 'currentLocation', type: 'relationship', relationTo: 'locations' },
    { name: 'currentLocationLabel', type: 'text' },
    { name: 'factions', type: 'relationship', relationTo: 'factions', hasMany: true },
    { name: 'regions', type: 'relationship', relationTo: 'regions', hasMany: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'alive',
      options: ['alive', 'missing', 'imprisoned', 'dead', 'unknown'].map((v) => ({ label: v, value: v })),
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'accentHue', type: 'number', min: 0, max: 360 },
    ...slugField('name'),
  ],
}
