import type { Media } from '@/payload-types'

/**
 * Pull a usable portrait URL out of a relationship value (Media doc, id, or null).
 * Prefers the `square` size, then `medium`, then the original.
 * Returns null when no usable URL is present (id-only, missing, or empty doc).
 */
export const portraitUrl = (p: Media | number | string | null | undefined): string | null => {
  if (!p || typeof p !== 'object') return null
  const sizes = (p as Media).sizes
  if (sizes?.square?.url) return sizes.square.url
  if (sizes?.medium?.url) return sizes.medium.url
  if ((p as Media).url) return (p as Media).url ?? null
  return null
}
