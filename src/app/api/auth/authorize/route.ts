import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { findValidSession, SSO_SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { createAuthorizationCode } from '@/lib/auth/authorization-code'

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.searchParams.get('redirect_url')

  if (!redirectUrl) {
    return NextResponse.json(
      { success: false, error: 'redirect_url 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  // 허용된 URL인지 확인
  const allowed = await prisma.allowedRedirect.findFirst({
    where: { url: redirectUrl, isActive: true },
  })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: '등록되지 않은 리다이렉트 URL입니다.' },
      { status: 403 }
    )
  }

  // SSO 세션 쿠키 확인
  const sessionId = request.cookies.get(SSO_SESSION_COOKIE_NAME)?.value
  if (sessionId) {
    const session = await findValidSession(sessionId)
    if (session) {
      // 이미 로그인된 상태 → 인가 코드 발급 후 리다이렉트
      const code = await createAuthorizationCode(session.userId, redirectUrl)
      const callbackUrl = new URL(redirectUrl)
      callbackUrl.searchParams.set('code', code)
      return NextResponse.redirect(callbackUrl.toString())
    }
  }

  // 로그인 필요 → 로그인 페이지로 리다이렉트
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const loginUrl = new URL('/login', appUrl)
  loginUrl.searchParams.set('redirect_url', redirectUrl)
  return NextResponse.redirect(loginUrl.toString())
}
