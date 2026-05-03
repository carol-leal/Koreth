import type { Field, Where } from 'payload'

const slugify = (input: string): string =>
  input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (sourceField: string = 'name'): Field[] => [
  {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Auto-generated from name; edit only if you know what you are doing.',
    },
    hooks: {
      beforeValidate: [
        async ({ data, value, req, originalDoc, operation, collection }) => {
          // Honor an explicit slug typed by an admin — leave uniqueness enforcement to the DB.
          if (typeof value === 'string' && value.length > 0) return slugify(value)

          const source = data?.[sourceField]
          if (typeof source !== 'string') return value
          const base = slugify(source)
          if (!base) return base

          // Auto-generated path: dedupe by appending -2, -3, … so concurrent "new X" placeholders
          // (e.g. multiple "Untitled event" entries) don't collide on the unique slug index.
          const payload = req?.payload
          const collectionSlug = collection?.slug
          if (!payload || !collectionSlug) return base

          const ownId = operation === 'update' ? originalDoc?.id : undefined
          let candidate = base
          for (let n = 2; ; n++) {
            const where: Where =
              ownId != null
                ? { and: [{ slug: { equals: candidate } }, { id: { not_equals: ownId } }] }
                : { slug: { equals: candidate } }
            const existing = await payload.find({
              collection: collectionSlug as Parameters<typeof payload.find>[0]['collection'],
              where,
              limit: 1,
              depth: 0,
              pagination: false,
            })
            if (existing.docs.length === 0) return candidate
            candidate = `${base}-${n}`
          }
        },
      ],
    },
  },
]
