import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { createInvitation } from '@/lib/auth/invitation'
import { inviteUserSchema } from '@/lib/schemas/auth'
import { sendMail } from '@/lib/mail/smtp'
import { invitationTemplate } from '@/lib/mail/templates'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const invitations = await prisma.invitation.findMany({
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: invitations })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireRole(request, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ])

    const body = await request.json()
    const parsed = inviteUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data

    // ADMIN은 ADMIN 역할로 초대 불가
    if (payload.role === UserRole.ADMIN && role === 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin 역할 초대는 Super Admin만 가능합니다.',
        },
        { status: 403 }
      )
    }

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
        parsed.data.email,
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
