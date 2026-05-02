'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { EntityIndexEntry } from '@/utilities/getEntityIndex'

/** Tooltip anchored to the centre of a hovered span. The Tip component reads
 *  the anchor rect and chooses left/top + above-or-below based on viewport
 *  space, so the tooltip always points at the hovered word. */
export type TipState = {
  name: string
  /** Horizontal centre of the hovered element (viewport coords). */
  centerX: number
  /** Top edge of the hovered element. */
  top: number
  /** Bottom edge of the hovered element. */
  bottom: number
} | null

type Ctx = {
  index: Record<string, EntityIndexEntry>
  pattern: RegExp | null
  tip: TipState
  show: (name: string, anchor: HTMLElement) => void
  hide: () => void
}

const TipCtx = createContext<Ctx>({
  index: {},
  pattern: null,
  tip: null,
  show: () => {},
  hide: () => {},
})

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const TipProvider: React.FC<{ entities: EntityIndexEntry[]; children: React.ReactNode }> = ({
  entities,
  children,
}) => {
  const { index, pattern } = useMemo(() => {
    const idx: Record<string, EntityIndexEntry> = {}
    for (const e of entities) idx[e.name] = e
    const names = Object.keys(idx).sort((a, b) => b.length - a.length)
    const pat = names.length ? new RegExp('(' + names.map(escape).join('|') + ')', 'g') : null
    return { index: idx, pattern: pat }
  }, [entities])

  const [tip, setTip] = useState<TipState>(null)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((name: string, anchor: HTMLElement) => {
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => {
      const r = anchor.getBoundingClientRect()
      setTip({ name, centerX: r.left + r.width / 2, top: r.top, bottom: r.bottom })
    }, 120)
  }, [])

  const hide = useCallback(() => {
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => setTip(null), 160)
  }, [])

  return (
    <TipCtx.Provider value={{ index, pattern, tip, show, hide }}>
      {children}
    </TipCtx.Provider>
  )
}

export const useTip = () => useContext(TipCtx)
