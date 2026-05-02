import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Factions: CollectionConfig = {
  slug: 'factions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tone'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/factions/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/factions/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'tone',
      type: 'select',
      required: true,
      defaultValue: 'Neutral',
      options: ['Ally', 'Antagonist', 'Neutral', 'Historical', 'Mystery'].map((v) => ({ label: v, value: v })),
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'seatLocation', type: 'relationship', relationTo: 'locations' },
    {
      name: 'relatedFactions',
      type: 'relationship',
      relationTo: 'factions',
      hasMany: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'accentHue', type: 'number', min: 0, max: 360 },
    ...slugField('name'),
  ],
}
