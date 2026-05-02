'use client'

import React from 'react'

type Props = {
  name: string
  hue: number
  kind: string
  /** If provided (e.g. a deity's `symbol` field from Payload), it overrides the
   *  initials and is rendered as the central glyph. */
  symbol?: string
}

export const CodexPortrait: React.FC<Props> = ({ name, hue, kind, symbol }) => {
  const seed = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const ring = (seed % 5) + 3
  const c1 = `oklch(0.55 0.22 ${hue})`
  const c2 = `oklch(0.22 0.08 ${(hue + 60) % 360})`
  const c3 = `oklch(0.7 0.18 ${(hue + 200) % 360})`
  const pattern = kind === 'regions' || kind === 'locations'
  const usingSymbol = !!symbol

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`r-${seed}`} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={c3} stopOpacity="0.45" />
          <stop offset="100%" stopColor={c3} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#g-${seed})`} />
      <rect width="200" height="200" fill={`url(#r-${seed})`} />
      {[...Array(ring)].map((_, i) => (
        <circle key={i} cx="100" cy="100" r={30 + i * 18} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="0.6" />
      ))}
      <g stroke="oklch(1 0 0 / 0.35)" strokeWidth="1" fill="none">
        <path d="M10,10 L10,22 M10,10 L22,10" />
        <path d="M190,10 L190,22 M190,10 L178,10" />
        <path d="M10,190 L10,178 M10,190 L22,190" />
        <path d="M190,190 L190,178 M190,190 L178,190" />
      </g>
      {pattern &&
        [...Array(8)].map((_, i) => {
          const a = (seed + i * 47) % 360
          const r = 60 + (i * 11) % 30
          const x = 100 + Math.cos((a * Math.PI) / 180) * r
          const y = 100 + Math.sin((a * Math.PI) / 180) * r
          return <circle key={i} cx={x} cy={y} r="1.4" fill="oklch(1 0 0 / 0.5)" />
        })}
      {usingSymbol ? (
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontSize="68"
          fill="oklch(1 0 0 / 0.92)"
          style={{ filter: `drop-shadow(0 2px 8px ${c1})` }}
        >
          {symbol}
        </text>
      ) : (
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontSize="62"
          fontFamily="ui-serif, Georgia"
          fontStyle="italic"
          fontWeight="400"
          fill="oklch(1 0 0 / 0.95)"
          style={{ filter: `drop-shadow(0 2px 8px ${c1})` }}
        >
          {initials}
        </text>
      )}
      <text
        x="100"
        y="186"
        textAnchor="middle"
        fontFamily="ui-monospace"
        fontSize="6"
        letterSpacing="0.18em"
        fill="oklch(1 0 0 / 0.4)"
      >
        {(kind || 'entry').toUpperCase()}
      </text>
    </svg>
  )
}
