import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

/**
 * A folio is one author's writeup of a session. Multiple folios can exist
 * for the same session — each player can record the events from their own
 * voice. Session-level metadata (number, title, in-world date) lives on
 * Sessions; per-author prose lives here.
 */
export const Folios: CollectionConfig = {
  slug: 'folios',
  admin: {
    useAsTitle: 'authorLabel',
    defaultColumns: ['session', 'authorLabel', 'updatedAt'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: 'createdAt',
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
    { name: 'session', type: 'relationship', relationTo: 'sessions', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'authorLabel',
      type: 'text',
      admin: { description: 'In-world byline; may differ from the user account.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'The opening line — used as the dropcap.' },
    },
    { name: 'body', type: 'richText', localized: true, admin: { description: 'The folio body.' } },
    {
      name: 'marginalia',
      type: 'richText',
      localized: true,
      admin: { description: 'A note in the warmer hand, added later.' },
    },
    {
      name: 'lastAmendedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'lastAmendedByLabel', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastAmendedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
