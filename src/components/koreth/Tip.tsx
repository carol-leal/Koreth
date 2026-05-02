'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'
import { useTip } from './TipContext'

const KIND_LABEL: Record<string, string> = {
  npc: 'npc',
  character: 'character',
  location: 'location',
  region: 'region',
  faction: 'faction',
  item: 'item',
  deity: 'deity',
}

const GAP = 10
const MARGIN = 16

export const Tip: React.FC = () => {
  const { tip, index } = useTip()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  // Compute position once the tooltip element exists so we can use its real
  // measured dimensions (more accurate than an estimate).
  useLayoutEffect(() => {
    if (!tip || !ref.current) {
      setPos(null)
      return
    }
    const el = ref.current
    const w = el.offsetWidth
    const h = el.offsetHeight
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800

    // Centre horizontally on the hovered span; clamp to viewport.
    let left = tip.centerX - w / 2
    if (left < MARGIN) left = MARGIN
    if (left + w > vw - MARGIN) left = vw - MARGIN - w

    // Prefer below; flip above if it would overflow the viewport.
    let top = tip.bottom + GAP
    if (top + h > vh - MARGIN) top = tip.top - h - GAP
    if (top < MARGIN) top = MARGIN

    setPos({ left, top })
  }, [tip])

  if (!tip) return null
  const ent = index[tip.name]
  if (!ent) return null

  return (
    <div
      ref={ref}
      className="tt2"
      style={{
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        // Hide briefly until layout is computed to avoid a flash at 0,0.
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      <div className="tt2-eye">{KIND_LABEL[ent.kind] ?? ent.kind}</div>
      <div className="tt2-name">{ent.name}</div>
      {ent.summary && <div className="tt2-body">{ent.summary}</div>}
    </div>
  )
}
