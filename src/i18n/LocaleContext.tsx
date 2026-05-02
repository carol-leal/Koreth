'use client'

import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, translate, type DictKey, type Locale } from './index'

type Ctx = {
  locale: Locale
  t: (key: DictKey, vars?: Record<string, string | number>) => string
  setLocale: (next: Locale) => void
}

const C = createContext<Ctx>({
  locale: 'es',
  t: (k) => k,
  setLocale: () => {},
})

export const LocaleProvider: React.FC<{ locale: Locale; children: React.ReactNode }> = ({
  locale,
  children,
}) => {
  const router = useRouter()
  const setLocale = useCallback(
    (next: Locale) => {
      // 1 year cookie, root path so server sees it on every request.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
      router.refresh()
    },
    [router],
  )
  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: (k, vars) => translate(locale, k, vars),
      setLocale,
    }),
    [locale, setLocale],
  )
  return <C.Provider value={value}>{children}</C.Provider>
}

export const useT = () => useContext(C)
