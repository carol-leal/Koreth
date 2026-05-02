'use client'

import React from 'react'
import { useT } from '@/i18n/LocaleContext'
import type { Locale } from '@/i18n'

const LABEL: Record<Locale, string> = { es: 'ES', en: 'EN' }

export const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useT()
  return (
    <div className="locale-switcher" role="group" aria-label={t('locale.switch')}>
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          className={'locale-chip' + (locale === l ? ' active' : '')}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          title={t(`locale.${l}`)}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  )
}
