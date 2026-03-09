import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'
import {
  createSsoSession,
  SSO_SESSION_COOKIE_NAME,
  SSO_SESSION_MAX_AGE,
} from '@/lib/auth/session'
import { createAuthorizationCode } from '@/lib/auth/authorization-code'
import { recordLoginSuccess, recordLoginFailure } from '@/lib/auth/login-log'
import { getRequestMeta } from '@/lib/auth/guard'
import { loginSchema } from '@/lib/schemas/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data
  const redirectUrl = body.redirectUrl as string | undefined
  const { userAgent, ipAddress } = getRequestMeta(request)

  // 사용자 조회
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    if (user) {
      await recordLoginFailure(
        user.id,
        email,
        '비활성화된 계정',
        userAgent,
        ipAddress
      )
    }
    return NextResponse.json(
      { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  }

  // 비밀번호 검증
  const isValid = await verifyPassword(password, user.hashedPassword)
  if (!isValid) {
    await recordLoginFailure(
      user.id,
      email,
      '비밀번호 불일치',
      userAgent,
      ipAddress
    )
    return NextResponse.json(
      { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  }

  // SSO 세션 생성
  const session = await createSsoSession(user.id, userAgent, ipAddress)

  // 마지막 로그인 시간 업데이트
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // 로그인 성공 기록
  await recordLoginSuccess(user.id, email, redirectUrl, userAgent, ipAddress)

  // redirect_url이 있으면 인가 코드 발급
  if (redirectUrl) {
    const allowed = await prisma.allowedRedirect.findFirst({
      where: { url: redirectUrl, isActive: true },
    })

    if (allowed) {
      const code = await createAuthorizationCode(user.id, redirectUrl)
      const response = NextResponse.json({
        success: true,
        data: { redirectUrl, code },
      })
      response.cookies.set(SSO_SESSION_COOKIE_NAME, session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SSO_SESSION_MAX_AGE,
        path: '/',
      })
      return response
    }
  }

  // redirect_url 없으면 SSO 대시보드로
  const response = NextResponse.json({
    success: true,
    data: { redirectUrl: '/dashboard' },
  })
  response.cookies.set(SSO_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SSO_SESSION_MAX_AGE,
    path: '/',
  })
  return response
}
