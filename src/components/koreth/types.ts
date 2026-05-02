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
}

export type CodexTabId = 'npcs' | 'regions' | 'locations' | 'factions' | 'items' | 'pantheon'

export const ACTS = [
  { id: 'prologue', label: 'Prologue' },
  { id: 'codex', label: 'Codex' },
  { id: 'chronicle', label: 'Chronicle' },
  { id: 'dramatis', label: 'Party' },
  { id: 'quests', label: 'Quests' },
  { id: 'carto', label: 'Cartography' },
] as const

export type ActId = (typeof ACTS)[number]['id']
