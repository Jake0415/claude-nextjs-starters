import { prisma } from '@/lib/db/prisma'
import { v4 as uuidv4 } from 'uuid'

const CODE_EXPIRY_MS = 30 * 1000 // 30초

export async function createAuthorizationCode(
  userId: string,
  redirectUrl: string
) {
  const code = uuidv4()
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS)

  await prisma.authorizationCode.create({
    data: {
      code,
      userId,
      redirectUrl,
      expiresAt,
    },
  })

  return code
}

export async function exchangeAuthorizationCode(code: string) {
  const record = await prisma.authorizationCode.findUnique({
    where: { code },
  })

  if (!record) return null
  if (record.isUsed) return null
  if (record.expiresAt < new Date()) return null

  // 1회용 처리
  await prisma.authorizationCode.update({
    where: { id: record.id },
    data: { isUsed: true },
  })

  return {
    userId: record.userId,
    redirectUrl: record.redirectUrl,
  }
}
