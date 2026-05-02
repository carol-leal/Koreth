import type { Metadata } from 'next'
import React from 'react'

import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'Korêth — A reader for the chronicle',
  description: 'A high-fantasy chronicle in progress.',
}
