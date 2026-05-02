'use client'

import React from 'react'
import { useTip } from './TipContext'

export const LinkText: React.FC<{ text: string }> = ({ text }) => {
  const { pattern, index, show, hide } = useTip()
  if (!pattern || !text) return <>{text}</>
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((p, i) =>
        index[p] ? (
          <span
            key={i}
            className="linkified"
            onMouseEnter={(e) => show(p, e.currentTarget)}
            onMouseLeave={hide}
          >
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  )
}
