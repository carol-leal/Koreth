import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminFieldAccess } from '../../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => user?.role === 'admin',
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    { name: 'displayLabel', type: 'text', admin: { description: 'Optional folio byline override.' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'player',
      options: [
        { label: 'Admin (DM / Chronicler)', value: 'admin' },
        { label: 'Player', value: 'player' },
      ],
      access: {
        update: isAdminFieldAccess,
      },
    },
    {
      name: 'pc',
      type: 'relationship',
      relationTo: 'characters',
      hasMany: false,
      admin: { description: "Player's character (leave empty for admins)." },
    },
  ],
  timestamps: true,
}
