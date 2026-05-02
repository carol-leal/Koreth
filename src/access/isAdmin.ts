import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminFieldAccess = ({ req: { user } }: { req: { user?: { role?: string } | null } }) =>
  user?.role === 'admin'
