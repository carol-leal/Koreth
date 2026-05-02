import { en } from './dict-en'
import { es } from './dict-es'
import type { DictKey, Dictionary } from './dict-en'

export type Locale = 'es' | 'en'

export const LOCALES: Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'es'
export const LOCALE_COOKIE = 'koreth-locale'

const dicts: Record<Locale, Dictionary> = { en, es }

export const isLocale = (v: unknown): v is Locale => v === 'es' || v === 'en'

export const interpolate = (s: string, vars?: Record<string, string | number>): string => {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
}

/** Translate a key in a given locale. Falls back to English then the raw key. */
export const translate = (
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>,
): string => {
  const d = dicts[locale] || dicts[DEFAULT_LOCALE]
  const raw = d[key] ?? en[key] ?? key
  return interpolate(raw, vars)
}

export type { DictKey, Dictionary }
export { en, es }
