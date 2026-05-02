'use client'

import React, { createContext, useContext, useMemo } from 'react'

export type SessionUser = {
  id: number | string
  name: string
  email: string
  role: 'admin' | 'player'
  pcSlug?: string | null
} | null

export type Capabilities = {
  user: SessionUser
  isDM: boolean
  isPlayer: boolean
  canAddSession: boolean
  canEditAny: boolean
  canEditPC: (pcSlug?: string | null) => boolean
  canEditChronicle: (authorName?: string | null) => boolean
}

const Ctx = createContext<Capabilities>({
  user: null,
  isDM: false,
  isPlayer: false,
  canAddSession: false,
  canEditAny: false,
  canEditPC: () => false,
  canEditChronicle: () => false,
})

export const AuthProvider: React.FC<{ user: SessionUser; children: React.ReactNode }> = ({ user, children }) => {
  const value = useMemo<Capabilities>(() => {
    const isDM = user?.role === 'admin'
    const isPlayer = user?.role === 'player'
    return {
      user,
      isDM,
      isPlayer,
      canAddSession: !!user,
      canEditAny: isDM,
      canEditPC: (pcSlug) => isDM || (isPlayer && !!pcSlug && user?.pcSlug === pcSlug),
      canEditChronicle: (authorName) => isDM || (isPlayer && !!authorName && user?.name === authorName),
    }
  }, [user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth3 = () => useContext(Ctx)
