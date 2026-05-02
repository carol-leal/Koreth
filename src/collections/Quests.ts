import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Quests: CollectionConfig = {
  slug: 'quests',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'priority'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity(() => ['/quests'])],
    afterDelete: [revalidateKorethDelete(() => ['/quests'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'open', 'complete'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'side',
      options: ['main', 'side', 'mystery'].map((v) => ({ label: v, value: v })),
    },
    { name: 'summary', type: 'textarea', localized: true },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'text', type: 'text', required: true, localized: true },
        { name: 'done', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'relatedNpcs', type: 'relationship', relationTo: 'npcs', hasMany: true },
    { name: 'relatedLocations', type: 'relationship', relationTo: 'locations', hasMany: true },
    { name: 'relatedFactions', type: 'relationship', relationTo: 'factions', hasMany: true },
    { name: 'linkedSession', type: 'relationship', relationTo: 'sessions' },
    ...slugField('title'),
  ],
}
