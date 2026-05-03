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
    group: 'Koreth',
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
  versions: { drafts: false, maxPerDoc: 100 },
  hooks: {
    afterChange: [revalidateKorethEntity(() => ['/'])],
    afterDelete: [revalidateKorethDelete(() => ['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'number', type: 'number', required: true, unique: true },
    { name: 'inWorldDate', type: 'text', localized: true },
    { name: 'realDate', type: 'date' },
    {
      name: 'relatedEntities',
      type: 'relationship',
      relationTo: ['npcs', 'locations', 'factions', 'deities', 'items'],
      hasMany: true,
    },
    // ----- Legacy single-folio fields -----
    // Per-author prose now lives on the Folios collection. These fields are
    // retained so existing data isn't lost; run the /next/migrate-folios
    // endpoint once to copy them into Folio rows. Safe to remove afterwards.
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Legacy — use Folios.' },
    },
    { name: 'authorLabel', type: 'text', admin: { readOnly: true, description: 'Legacy — use Folios.' } },
    { name: 'excerpt', type: 'textarea', localized: true, admin: { readOnly: true, description: 'Legacy — use Folios.' } },
    { name: 'body', type: 'richText', localized: true, admin: { readOnly: true, description: 'Legacy — use Folios.' } },
    { name: 'marginalia', type: 'richText', localized: true, admin: { readOnly: true, description: 'Legacy — use Folios.' } },
    { name: 'lastAmendedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastAmendedByLabel', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastAmendedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    ...slugField('title'),
  ],
}
