import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One-time migration: copy each legacy Session's body/marginalia/excerpt/author
 * into a Folio row that references the Session. Idempotent — sessions that
 * already have a Folio are skipped, so re-running is safe.
 *
 * Hit this endpoint once per environment after deploying the Folios collection.
 * Locales are migrated by reading each session in `es` then `en` and PATCHing
 * the resulting folio in the matching locale.
 */
const LOCALES = ['es', 'en'] as const

export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Only consider sessions that don't already have at least one folio.
    const sessions = await payload.find({
      collection: 'sessions',
      limit: 1000,
      depth: 0,
      locale: 'es',
      pagination: false,
    })

    const created: number[] = []
    const skipped: number[] = []

    for (const session of sessions.docs) {
      const existing = await payload.find({
        collection: 'folios',
        where: { session: { equals: session.id } },
        limit: 1,
        depth: 0,
      })
      if (existing.docs.length > 0) {
        skipped.push(session.id as number)
        continue
      }

      // Read each locale separately so we can preserve localized prose.
      const localized: Record<string, { body: unknown; marginalia: unknown; excerpt: string | null }> = {}
      for (const locale of LOCALES) {
        const fresh = await payload.findByID({
          collection: 'sessions',
          id: session.id,
          depth: 0,
          locale,
          fallbackLocale: false,
        })
        localized[locale] = {
          body: fresh.body ?? null,
          marginalia: fresh.marginalia ?? null,
          excerpt: typeof fresh.excerpt === 'string' ? fresh.excerpt : null,
        }
      }

      // Skip sessions that have no prose at all — nothing worth migrating.
      const hasAnyProse = LOCALES.some(
        (l) => localized[l].body || localized[l].marginalia || localized[l].excerpt,
      )
      if (!hasAnyProse) {
        skipped.push(session.id as number)
        continue
      }

      const author =
        typeof session.author === 'object' && session.author
          ? (session.author.id as number)
          : (session.author as number | undefined)

      // Create the folio in the default locale, then PATCH for the other.
      const initialLocale = LOCALES[0]
      const folio = await payload.create({
        collection: 'folios',
        locale: initialLocale,
        data: {
          session: session.id as number,
          author: author!,
          authorLabel: session.authorLabel ?? null,
          excerpt: localized[initialLocale].excerpt,
          body: localized[initialLocale].body as never,
          marginalia: localized[initialLocale].marginalia as never,
          lastAmendedBy:
            typeof session.lastAmendedBy === 'object' && session.lastAmendedBy
              ? (session.lastAmendedBy.id as number)
              : (session.lastAmendedBy as number | null | undefined) ?? null,
          lastAmendedByLabel: session.lastAmendedByLabel ?? null,
          lastAmendedAt: session.lastAmendedAt ?? null,
        },
      })

      for (const locale of LOCALES.slice(1)) {
        await payload.update({
          collection: 'folios',
          id: folio.id,
          locale,
          data: {
            excerpt: localized[locale].excerpt,
            body: localized[locale].body as never,
            marginalia: localized[locale].marginalia as never,
          },
        })
      }

      created.push(session.id as number)
    }

    return Response.json({
      success: true,
      createdFolios: created.length,
      skipped: skipped.length,
      createdSessionIds: created,
      skippedSessionIds: skipped,
    })
  } catch (e) {
    return Response.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
