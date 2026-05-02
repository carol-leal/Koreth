import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const TAG = 'koreth-entities'

// `revalidateTag` / `revalidatePath` only work inside a Next.js request context.
// When seeding via a CLI script the static-generation store is absent and the
// call throws. These wrappers swallow that error so hooks never break the
// underlying create/update/delete operation.
const safeTag = (t: string) => {
  try {
    ;(revalidateTag as unknown as (tag: string, profile?: string) => void)(t, 'default')
  } catch {
    /* not in a request context — ignore */
  }
}

const safePath = (p: string) => {
  try {
    revalidatePath(p)
  } catch {
    /* not in a request context — ignore */
  }
}

export const revalidateKorethEntity =
  (paths: (slug: string) => string[]): CollectionAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (context?.disableRevalidate) return doc
    payload.logger.info(`Revalidating Koreth entity: ${doc.slug ?? doc.id}`)
    safeTag(TAG)
    if (typeof doc.slug === 'string') {
      for (const p of paths(doc.slug)) safePath(p)
    }
    return doc
  }

export const revalidateKorethDelete =
  (paths: (slug: string) => string[]): CollectionAfterDeleteHook =>
  ({ doc, req: { context } }) => {
    if (context?.disableRevalidate) return doc
    safeTag(TAG)
    if (typeof doc?.slug === 'string') {
      for (const p of paths(doc.slug)) safePath(p)
    }
    return doc
  }

export const revalidateCampaign: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  safeTag('global_campaign')
  safeTag(TAG)
  safePath('/')
  return doc
}
