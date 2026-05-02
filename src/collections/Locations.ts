import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'kind'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/locations/${slug}`, '/cartography'])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/locations/${slug}`, '/cartography'])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'region', type: 'relationship', relationTo: 'regions', required: true },
    { name: 'kind', type: 'text', required: true },
    { name: 'description', type: 'richText' },
    {
      name: 'mapPosition',
      type: 'group',
      fields: [
        { name: 'x', type: 'number', min: 0, max: 100 },
        { name: 'y', type: 'number', min: 0, max: 100 },
      ],
    },
    { name: 'relatedNpcs', type: 'relationship', relationTo: 'npcs', hasMany: true },
    { name: 'relatedFactions', type: 'relationship', relationTo: 'factions', hasMany: true },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'accentHue', type: 'number', min: 0, max: 360 },
    ...slugField('name'),
  ],
}
