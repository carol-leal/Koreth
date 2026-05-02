import 'server-only'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './index'

/** Read the user's locale from the cookie, server-side. Defaults to Spanish. */
export const getServerLocale = async (): Promise<Locale> => {
  const c = await cookies()
  const v = c.get(LOCALE_COOKIE)?.value
  return isLocale(v) ? v : DEFAULT_LOCALE
}
