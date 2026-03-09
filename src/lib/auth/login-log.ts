import { prisma } from '@/lib/db/prisma'

type LogAction = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'

async function createLog(params: {
  userId: string
  email: string
  action: LogAction
  appUrl?: string
  userAgent?: string
  ipAddress?: string
  detail?: string
}) {
  return prisma.loginLog.create({ data: params })
}

export async function recordLoginSuccess(
  userId: string,
  email: string,
  appUrl?: string,
  userAgent?: string,
  ipAddress?: string
) {
  return createLog({
    userId,
    email,
    action: 'LOGIN_SUCCESS',
    appUrl,
    userAgent,
    ipAddress,
  })
}

export async function recordLoginFailure(
  userId: string,
  email: string,
  detail?: string,
  userAgent?: string,
  ipAddress?: string
) {
  return createLog({
    userId,
    email,
    action: 'LOGIN_FAILED',
    detail,
    userAgent,
    ipAddress,
  })
}

export async function recordLogout(
  userId: string,
  email: string,
  userAgent?: string,
  ipAddress?: string
) {
  return createLog({ userId, email, action: 'LOGOUT', userAgent, ipAddress })
}

export async function getLoginLogs(params: {
  page?: number
  limit?: number
  action?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { page = 1, limit = 20, action, userId, startDate, endDate } = params
  const where: Record<string, unknown> = {}

  if (action) where.action = action
  if (userId) where.userId = userId
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    }
  }

  const [logs, total] = await Promise.all([
    prisma.loginLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.loginLog.count({ where }),
  ])

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getUserLoginLogs(userId: string, page = 1, limit = 20) {
  return getLoginLogs({ userId, page, limit })
}
