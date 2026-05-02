import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Regions: CollectionConfig = {
  slug: 'regions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'kind'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/regions/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/regions/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'area',
      type: 'select',
      required: true,
      options: [
        { label: 'North', value: 'North' },
        { label: 'Centre', value: 'Centre' },
        { label: 'South', value: 'South' },
        { label: 'Islands', value: 'Islands' },
      ],
    },
    { name: 'kind', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'richText' },
    {
      name: 'mapPosition',
      type: 'group',
      fields: [
        { name: 'x', type: 'number', min: 0, max: 100 },
        { name: 'y', type: 'number', min: 0, max: 100 },
      ],
    },
    { name: 'accentHue', type: 'number', min: 0, max: 360, defaultValue: 285 },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    ...slugField('name'),
  ],
}
