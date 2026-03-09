import { prisma } from '@/lib/db/prisma'

const SSO_SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8시간

export async function createSsoSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const expiresAt = new Date(Date.now() + SSO_SESSION_DURATION_MS)

  return prisma.ssoSession.create({
    data: {
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    },
  })
}

export async function findValidSession(sessionId: string) {
  const session = await prisma.ssoSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt < new Date()) return null
  if (!session.user.isActive) return null

  return session
}

export async function revokeSession(sessionId: string) {
  await prisma.ssoSession
    .delete({
      where: { id: sessionId },
    })
    .catch(() => {
      // 이미 삭제된 세션은 무시
    })
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.ssoSession.deleteMany({
    where: { userId },
  })
}

export const SSO_SESSION_COOKIE_NAME = 'sso_session'
export const SSO_SESSION_MAX_AGE = 8 * 60 * 60 // 8시간 (초)
