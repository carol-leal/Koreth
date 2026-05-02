import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'inWorldDate', 'kind', 'sortOrder'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: 'sortOrder',
  hooks: {
    afterChange: [revalidateKorethEntity(() => ['/'])],
    afterDelete: [revalidateKorethDelete(() => ['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'inWorldDate',
      type: 'text',
      localized: true,
      admin: { description: 'Free-form, e.g. "Yr 350, late spring".' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower = earlier. Use to fix order when in-world dates are fuzzy.' },
    },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'event',
      options: ['event', 'battle', 'discovery', 'death', 'pact', 'prophecy', 'disaster'].map(
        (v) => ({
          label: v,
          value: v,
        }),
      ),
    },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'linkedSession', type: 'relationship', relationTo: 'sessions' },
    { name: 'relatedNpcs', type: 'relationship', relationTo: 'npcs', hasMany: true },
    { name: 'relatedLocations', type: 'relationship', relationTo: 'locations', hasMany: true },
    { name: 'relatedFactions', type: 'relationship', relationTo: 'factions', hasMany: true },
    ...slugField('title'),
  ],
}
