import { NextRequest, NextResponse } from 'next/server'
import { SSO_SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { revokeSession, revokeAllUserSessions } from '@/lib/auth/session'
import { revokeAllUserRefreshTokens } from '@/lib/auth/tokens'
import { recordLogout } from '@/lib/auth/login-log'
import {
  authenticateRequest,
  getRequestMeta,
  handleAuthError,
} from '@/lib/auth/guard'
import { findValidSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const { userAgent, ipAddress } = getRequestMeta(request)

  try {
    // Access Token으로 사용자 확인
    const payload = await authenticateRequest(request)

    // SSO 세션 종료
    const sessionId = request.cookies.get(SSO_SESSION_COOKIE_NAME)?.value
    if (sessionId) {
      await revokeSession(sessionId)
    }

    // 모든 SSO 세션 종료 + 모든 Refresh Token 무효화 (Single Logout)
    await Promise.all([
      revokeAllUserSessions(payload.sub),
      revokeAllUserRefreshTokens(payload.sub),
    ])

    // 로그아웃 기록
    await recordLogout(payload.sub, payload.email, userAgent, ipAddress)

    const response = NextResponse.json({ success: true })
    response.cookies.delete(SSO_SESSION_COOKIE_NAME)
    return response
  } catch (error) {
    // Access Token 없이도 세션 쿠키로 로그아웃 시도
    const sessionId = request.cookies.get(SSO_SESSION_COOKIE_NAME)?.value
    if (sessionId) {
      const session = await findValidSession(sessionId)
      if (session) {
        await Promise.all([
          revokeAllUserSessions(session.userId),
          revokeAllUserRefreshTokens(session.userId),
          recordLogout(
            session.userId,
            session.user.email,
            userAgent,
            ipAddress
          ),
        ])
        const response = NextResponse.json({ success: true })
        response.cookies.delete(SSO_SESSION_COOKIE_NAME)
        return response
      }
    }

    return handleAuthError(error)
  }
}
