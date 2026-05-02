'use client'

import React, { createContext, useContext, useMemo } from 'react'

export type SessionUser = {
  id: number | string
  name: string
  email: string
  role: 'admin' | 'player'
} | null

/**
 * The minimum shape of a Character we need to decide ownership. Accepts
 * either a populated `player` object (depth>=1) or a raw id (depth=0).
 */
export type OwnableCharacter = {
  player?: number | string | { id?: number | string } | null
} | null | undefined

const ownerIdOf = (c: OwnableCharacter): number | string | null => {
  const p = c?.player
  if (p == null) return null
  return typeof p === 'object' ? (p.id ?? null) : p
}

export type Capabilities = {
  user: SessionUser
  isDM: boolean
  isPlayer: boolean
  canAddSession: boolean
  canEditAny: boolean
  /** True if the current user is the DM, or owns the given character. */
  canEditPC: (character: OwnableCharacter) => boolean
  /** True if the current user owns the given character (player only). */
  isMyPC: (character: OwnableCharacter) => boolean
  canEditChronicle: (authorName?: string | null) => boolean
}

const Ctx = createContext<Capabilities>({
  user: null,
  isDM: false,
  isPlayer: false,
  canAddSession: false,
  canEditAny: false,
  canEditPC: () => false,
  isMyPC: () => false,
  canEditChronicle: () => false,
})

export const AuthProvider: React.FC<{ user: SessionUser; children: React.ReactNode }> = ({ user, children }) => {
  const value = useMemo<Capabilities>(() => {
    const isDM = user?.role === 'admin'
    const isPlayer = user?.role === 'player'
    const isMyPC: Capabilities['isMyPC'] = (c) => {
      if (!isPlayer || !user) return false
      const owner = ownerIdOf(c)
      return owner != null && owner === user.id
    }
    return {
      user,
      isDM,
      isPlayer,
      canAddSession: !!user,
      canEditAny: isDM,
      canEditPC: (c) => isDM || isMyPC(c),
      isMyPC,
      canEditChronicle: (authorName) => isDM || (isPlayer && !!authorName && user?.name === authorName),
    }
  }, [user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth3 = () => useContext(Ctx)
