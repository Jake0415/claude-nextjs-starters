import { prisma } from '@/lib/db/prisma'
import { v4 as uuidv4 } from 'uuid'
import { REFRESH_TOKEN_EXPIRES_SECONDS } from './jwt'

export async function createRefreshToken(
  userId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_SECONDS * 1000)

  const record = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    },
  })

  return { token, id: record.id }
}

export async function findValidRefreshToken(token: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return null
  if (record.isRevoked) {
    // 탈취 감지: revoke된 토큰으로 요청 → 해당 유저 전체 토큰 무효화
    await revokeAllUserRefreshTokens(record.userId)
    return null
  }
  if (record.expiresAt < new Date()) return null

  return record
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { isRevoked: true },
  })
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  })
}

// Refresh Token Rotation: 기존 토큰 revoke 후 새 토큰 발급
export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
  userAgent?: string,
  ipAddress?: string
) {
  await revokeRefreshToken(oldToken)
  return createRefreshToken(userId, userAgent, ipAddress)
}
