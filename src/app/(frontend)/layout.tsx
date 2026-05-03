import type { Metadata } from 'next'
import React from 'react'
import { getServerLocale } from '@/i18n/getServerLocale'
import { translate } from '@/i18n'
import { LocaleProvider } from '@/i18n/LocaleContext'

import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;700&family=Kalam:wght@300;400;700&display=swap"
        />
      </head>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  return {
    title: translate(locale, 'meta.title'),
    description: translate(locale, 'meta.description'),
  }
}
