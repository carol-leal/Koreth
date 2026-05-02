import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'authorLabel'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ data, req: { user }, operation }) => {
        if (operation === 'create' && user?.id) {
          if (!data.author) data.author = user.id
          if (!data.authorLabel) {
            const u = user as { displayLabel?: string; name?: string; email?: string }
            data.authorLabel = u.displayLabel || u.name || u.email
          }
        }
        return data
      },
    ],
    afterChange: [revalidateKorethEntity(() => ['/'])],
    afterDelete: [revalidateKorethDelete(() => ['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: ['open', 'following', 'resolved', 'dead-end'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Auto-set on create from the logged-in user.' },
    },
    { name: 'authorLabel', type: 'text' },
    { name: 'linkedSession', type: 'relationship', relationTo: 'sessions' },
    {
      name: 'notes',
      type: 'array',
      fields: [
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'authorLabel', type: 'text' },
        { name: 'text', type: 'textarea', required: true, localized: true },
        { name: 'createdAt', type: 'date', defaultValue: () => new Date().toISOString() },
      ],
    },
    ...slugField('title'),
  ],
}
