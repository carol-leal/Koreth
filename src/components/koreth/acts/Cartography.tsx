'use client'

import React from 'react'

export const Cartography: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        height: '100%',
        padding: '0 88px',
        textAlign: 'center',
      }}
    >
      <div
        className="eyebrow-sm"
        style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--ink-3)' }}
      >
        Act V · Cartography
      </div>
      <h2
        style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 88,
          lineHeight: 0.95,
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        The map, <em style={{ color: 'var(--ink-2)' }}>still being drawn.</em>
      </h2>
      <p
        style={{
          fontFamily: 'var(--display)',
          fontStyle: 'italic',
          fontSize: 22,
          lineHeight: 1.4,
          color: 'var(--ink-3)',
          maxWidth: '36ch',
          marginTop: 8,
        }}
      >
        coming soon — the cartographer is still inking the coastline.
      </p>
    </div>
  )
}
