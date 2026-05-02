import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateKorethEntity, revalidateKorethDelete } from '@/hooks/revalidateKoreth'

export const Items: CollectionConfig = {
  slug: 'items',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'rarity', 'ownerLabel'],
    group: 'Koreth',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateKorethEntity((slug) => [`/codex/items/${slug}`])],
    afterDelete: [revalidateKorethDelete((slug) => [`/codex/items/${slug}`])],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'kind', type: 'text', localized: true },
    {
      name: 'rarity',
      type: 'select',
      defaultValue: 'Common',
      options: ['Common', 'Uncommon', 'Rare', 'Very rare', 'Legendary', 'Unknown'].map((v) => ({
        label: v,
        value: v,
      })),
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'ownerCharacter', type: 'relationship', relationTo: 'characters' },
    { name: 'ownerFaction', type: 'relationship', relationTo: 'factions' },
    { name: 'ownerNpc', type: 'relationship', relationTo: 'npcs' },
    {
      name: 'ownerLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Display fallback when no relation is set' },
    },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    ...slugField('name'),
  ],
}
