import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { revalidateCampaign } from '@/hooks/revalidateKoreth'

/**
 * Mirrors `D.campaign` from Design/data.js exactly. Anything that V3 hardcodes
 * in the Prologue component (next session, chapter cues, in-world date, etc.)
 * stays in component-level constants — not seeded here.
 */
export const Campaign: GlobalConfig = {
  slug: 'campaign',
  admin: { group: 'Koreth' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCampaign],
  },
  fields: [
    { name: 'name', type: 'text', defaultValue: 'Koreth' },
    { name: 'tagline', type: 'textarea', localized: true },
    {
      name: 'tagSource',
      type: 'text',
      localized: true,
      admin: { description: 'Citation rendered under the tagline.' },
    },
    { name: 'summary', type: 'richText', localized: true },
    { name: 'currentSession', type: 'number' },
    { name: 'partyName', type: 'text', localized: true },
    { name: 'partyLevel', type: 'number' },
    { name: 'partyXp', type: 'number' },
    { name: 'nextLevelXp', type: 'number' },
    {
      name: 'nextSession',
      type: 'group',
      admin: { description: 'Card shown in the Prologue. Editable inline by the DM.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: { description: 'Working title of the upcoming session.' },
        },
        {
          name: 'when',
          type: 'text',
          localized: true,
          admin: { description: 'When it will run (free text, e.g. "Next Saturday · 8pm").' },
        },
        {
          name: 'where',
          type: 'text',
          localized: true,
          admin: { description: 'Where it will run (free text).' },
        },
        {
          name: 'plan',
          type: 'textarea',
          localized: true,
          admin: { description: 'Planned hook / opening beat (one paragraph).' },
        },
      ],
    },
  ],
}
