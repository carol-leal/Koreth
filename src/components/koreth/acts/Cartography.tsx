'use client'

import React from 'react'
import { useT } from '@/i18n/LocaleContext'

export const Cartography: React.FC = () => {
  const { t } = useT()
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
        {t('carto.eyebrow')}
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
        {t('carto.headline.a')} <em style={{ color: 'var(--ink-2)' }}>{t('carto.headline.b')}</em>
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
        {t('carto.sub')}
      </p>
    </div>
  )
}
