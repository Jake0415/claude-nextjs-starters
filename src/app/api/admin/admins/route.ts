import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { createInvitation } from '@/lib/auth/invitation'
import { inviteUserSchema, toggleActiveSchema } from '@/lib/schemas/auth'
import { sendMail } from '@/lib/mail/smtp'
import { invitationTemplate } from '@/lib/mail/templates'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'USER'] } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    return handleAuthError(error)
  }
}

// 초대 방식으로 계정 생성
export async function POST(request: NextRequest) {
  try {
    const payload = await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const parsed = inviteUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data
    const invitation = await createInvitation(email, payload.sub, role)

    // 초대 메일 발송 시도
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')
    const inviteUrl = `${appUrl}/invite/${invitation.token}`

    try {
      await sendMail(
        email,
        '[MHSSO] 계정 초대',
        invitationTemplate(inviteUrl, invitation.invitedBy.name)
      )
    } catch {
      // SMTP 미설정 시에도 초대는 생성 (링크 직접 공유 가능)
    }

    return NextResponse.json(
      { success: true, data: { ...invitation, inviteUrl } },
      { status: 201 }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === '이미 등록된 이메일입니다.'
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      )
    }
    return handleAuthError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const parsed = toggleActiveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { id, isActive } = parsed.data

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user || user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Super Admin은 변경할 수 없습니다.' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    })

    // 비활성화 시 세션/토큰 즉시 무효화
    if (!isActive) {
      await prisma.$transaction([
        prisma.ssoSession.deleteMany({ where: { userId: id } }),
        prisma.refreshToken.updateMany({
          where: { userId: id },
          data: { isRevoked: true },
        }),
      ])
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return handleAuthError(error)
  }
}
