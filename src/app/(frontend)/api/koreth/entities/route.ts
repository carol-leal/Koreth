import { getCachedEntityIndex } from '@/utilities/getEntityIndex'

export async function GET() {
  const entities = await getCachedEntityIndex()
  return Response.json({ entities, generatedAt: new Date().toISOString() })
}
