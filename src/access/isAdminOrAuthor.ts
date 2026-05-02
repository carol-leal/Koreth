import type { Access } from 'payload'

/**
 * Returns access fn that allows admins full access, or restricts to docs whose
 * `authorField` matches the requesting user. Used for sessions (author) and
 * characters (player).
 */
export const isAdminOrAuthor =
  (authorField: string): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return { [authorField]: { equals: user.id } }
  }
