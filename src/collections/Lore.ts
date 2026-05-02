import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Lore: CollectionConfig = {
  slug: 'lore',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'era'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateKorethEntity(() => ['/'])],
    afterDelete: [revalidateKorethDelete(() => ['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'general',
      options: [
        'general',
        'cosmology',
        'history',
        'religion',
        'magic',
        'planes',
        'custom',
        'mystery',
      ].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'era',
      type: 'text',
      localized: true,
      admin: { description: 'When this fact applies — free text, e.g. "Before the Sundering".' },
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
      admin: { description: 'Names of NPCs, gods, places, factions, etc. auto-link as you write.' },
    },
    { name: 'accentHue', type: 'number', min: 0, max: 360, defaultValue: 320 },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    ...slugField('title'),
  ],
}
