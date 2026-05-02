import { getCachedEntityIndex } from '@/utilities/getEntityIndex'
import { getServerLocale } from '@/i18n/getServerLocale'

export async function GET() {
  const locale = await getServerLocale()
  const entities = await getCachedEntityIndex(locale)
  return Response.json({ entities, generatedAt: new Date().toISOString() })
}
