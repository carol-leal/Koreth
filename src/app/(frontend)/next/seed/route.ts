import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '@/endpoints/seed'

export async function POST() {
  try {
    const payload = await getPayload({ config })
    await seed({ payload })
    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
