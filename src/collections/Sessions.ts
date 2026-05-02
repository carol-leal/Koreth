import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['number', 'title', 'authorLabel', 'inWorldDate'],
    group: 'Korêth',
  },
  access: {
    read: anyone,
    // Any signed-in user (admin or player) can amend the chronicle. Folio
    // history is preserved via Payload versions.
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: '-number',
  // Each amend snapshots the prior state; "lastAmendedBy" is set in beforeChange.
  versions: { drafts: false, maxPerDoc: 100 },
  hooks: {
    beforeChange: [
      ({ data, req: { user }, operation }) => {
        if (operation === 'create' && !data.author && user?.id) {
          data.author = user.id
          if (!data.authorLabel) data.authorLabel = user.displayLabel || user.name || user.email
        }
        if (operation === 'update' && user?.id) {
          data.lastAmendedBy = user.id
          data.lastAmendedByLabel = user.displayLabel || user.name || user.email
          data.lastAmendedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [revalidateKorethEntity(() => ['/'])],
    afterDelete: [revalidateKorethDelete(() => ['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'number', type: 'number', required: true, unique: true },
    { name: 'inWorldDate', type: 'text', localized: true },
    { name: 'realDate', type: 'date' },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'authorLabel',
      type: 'text',
      admin: { description: 'In-world byline; may differ from the user account.' },
    },
    { name: 'excerpt', type: 'textarea', localized: true, admin: { description: 'The opening line — used as the dropcap.' } },
    { name: 'body', type: 'richText', localized: true, admin: { description: 'The folio body.' } },
    { name: 'marginalia', type: 'richText', localized: true, admin: { description: 'A note in the warmer hand, added later.' } },
    {
      name: 'relatedEntities',
      type: 'relationship',
      relationTo: ['npcs', 'locations', 'factions', 'deities', 'items'],
      hasMany: true,
    },
    {
      name: 'lastAmendedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'lastAmendedByLabel', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastAmendedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    ...slugField('title'),
  ],
}
