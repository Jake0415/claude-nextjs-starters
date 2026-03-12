import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const now = new Date()

    const [
      totalUsers,
      activeUsers,
      totalAdmins,
      totalApps,
      activeSessions,
      pendingInvitations,
      recentUsers,
      recentFailures,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.allowedRedirect.count({ where: { isActive: true } }),
      prisma.ssoSession.count({ where: { expiresAt: { gt: now } } }),
      prisma.invitation.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        where: {},
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.loginLog.findMany({
        where: { action: 'LOGIN_FAILED' },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalAdmins,
          totalApps,
          activeSessions,
          pendingInvitations,
        },
        recentUsers,
        recentFailures,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
