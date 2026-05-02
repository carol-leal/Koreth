'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useAuth3 } from './AuthContext'
import { useT } from '@/i18n/LocaleContext'

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

export const PersonaPill: React.FC = () => {
  const a = useAuth3()
  const { t } = useT()
  const router = useRouter()
  if (!a.user) {
    return (
      <Link href="/login" className="persona3 persona3-reader" style={{ textDecoration: 'none' }}>
        <span className="persona3-glyph">·</span>
        <span className="persona3-text">
          {t('pill.signin')}
          <em>{t('pill.readonly')}</em>
        </span>
      </Link>
    )
  }
  const onLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.refresh()
    }
  }
  return (
    <span className={'persona3 persona3-' + (a.isDM ? 'chronicler' : 'voice')} title={t('pill.account')}>
      <span className="persona3-glyph">{initialsOf(a.user.name)}</span>
      <span className="persona3-text">
        {a.user.name}
        <em>{a.isDM ? t('pill.dm') : t('pill.player')}</em>
      </span>
      <span className="persona3-out" onClick={onLogout} title={t('pill.signout')}>↩</span>
    </span>
  )
}
