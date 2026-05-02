import type {
  Region,
  Location,
  Faction,
  Npc,
  Item,
  Deity,
  Character,
  Session,
  Quest,
  Lead,
  Event,
  Lore,
  Campaign,
} from '@/payload-types'

export type KorethData = {
  campaign: Campaign
  regions: Region[]
  locations: Location[]
  factions: Faction[]
  npcs: Npc[]
  items: Item[]
  pantheon: Deity[]
  characters: Character[]
  sessions: Session[]
  quests: Quest[]
  leads: Lead[]
  events: Event[]
  lore: Lore[]
}

export type CodexTabId = 'npcs' | 'regions' | 'locations' | 'factions' | 'items' | 'pantheon' | 'lore'

export const ACTS = [
  { id: 'prologue', labelKey: 'act.prologue' },
  { id: 'codex', labelKey: 'act.codex' },
  { id: 'chronicle', labelKey: 'act.chronicle' },
  { id: 'timeline', labelKey: 'act.timeline' },
  { id: 'dramatis', labelKey: 'act.dramatis' },
  { id: 'quests', labelKey: 'act.quests' },
  { id: 'carto', labelKey: 'act.carto' },
] as const

export type ActId = (typeof ACTS)[number]['id']
