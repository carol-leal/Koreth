import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdminOrAuthor } from '@/access/isAdminOrAuthor'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'class', 'level', 'playerLabel'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: isAdminOrAuthor('player'),
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/characters/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/characters/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'retired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Hide from the active Party. The sheet is preserved so old chronicles still reference them.',
      },
    },
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Owning user; only that user (or admin) can edit this PC.' },
    },
    { name: 'playerLabel', type: 'text' },
    { name: 'class', type: 'text', required: true, localized: true },
    { name: 'subclass', type: 'text', localized: true },
    { name: 'level', type: 'number', min: 1, max: 20 },
    { name: 'race', type: 'text', localized: true },
    { name: 'quote', type: 'textarea', localized: true },
    {
      name: 'vitals',
      type: 'group',
      fields: [
        { name: 'hpCurrent', type: 'number' },
        { name: 'hpMax', type: 'number' },
        { name: 'ac', type: 'number' },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'STR', type: 'number' },
        { name: 'DEX', type: 'number' },
        { name: 'CON', type: 'number' },
        { name: 'INT', type: 'number' },
        { name: 'WIS', type: 'number' },
        { name: 'CHA', type: 'number' },
      ],
    },
    { name: 'accentHue', type: 'number', min: 0, max: 360 },
    { name: 'backstory', type: 'richText', localized: true },
    {
      name: 'gear',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true, localized: true },
        { name: 'item', type: 'relationship', relationTo: 'items' },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    ...slugField('name'),
  ],
}
