import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

export const getOptionalUser = async (): Promise<User | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null
  try {
    const payload = await getPayload({ config })
    const headers = new Headers({ Authorization: `JWT ${token}` })
    const result = await payload.auth({ headers })
    return (result.user as User | null) ?? null
  } catch {
    return null
  }
}
