import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { findValidInvitation } from '@/lib/auth/invitation'
import { hashPassword } from '@/lib/auth/password'
import { acceptInviteSchema } from '@/lib/schemas/auth'
import {
  createSsoSession,
  SSO_SESSION_COOKIE_NAME,
  SSO_SESSION_MAX_AGE,
} from '@/lib/auth/session'
import { getRequestMeta } from '@/lib/auth/guard'
import { recordLoginSuccess } from '@/lib/auth/login-log'

// 초대 토큰 유효성 확인
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const invitation = await findValidInvitation(token)

  if (!invitation) {
    return NextResponse.json(
      { success: false, error: '유효하지 않거나 만료된 초대입니다.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: { email: invitation.email, role: invitation.role },
  })
}

// 초대 수락 및 계정 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const invitation = await findValidInvitation(token)

  if (!invitation) {
    return NextResponse.json(
      { success: false, error: '유효하지 않거나 만료된 초대입니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const parsed = acceptInviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { name, password } = parsed.data
  const hashedPassword = await hashPassword(password)

  // 사용자 생성 + 초대 수락을 트랜잭션으로 원자적 처리
  const user = await prisma.$transaction(async tx => {
    const created = await tx.user.create({
      data: {
        name,
        email: invitation.email,
        hashedPassword,
        role: invitation.role,
        createdById: invitation.invitedById,
        lastLoginAt: new Date(),
      },
      select: { id: true, email: true, name: true, role: true },
    })
    await tx.invitation.update({
      where: { token },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })
    return created
  })

  // 자동 로그인: SSO 세션 생성 + 쿠키 설정
  const { userAgent, ipAddress } = getRequestMeta(request)
  const session = await createSsoSession(user.id, userAgent, ipAddress)

  // 로그인 성공 감사 로그 기록
  await recordLoginSuccess(
    user.id,
    user.email,
    '/dashboard',
    userAgent,
    ipAddress
  )

  const response = NextResponse.json(
    { success: true, data: { ...user, redirectUrl: '/dashboard' } },
    { status: 201 }
  )
  response.cookies.set(SSO_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SSO_SESSION_MAX_AGE,
    path: '/',
  })
  return response
}
