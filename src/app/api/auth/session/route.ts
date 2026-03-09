import { NextRequest, NextResponse } from 'next/server'
import { findValidSession, SSO_SESSION_COOKIE_NAME } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SSO_SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: '세션이 없습니다.' },
      { status: 401 }
    )
  }

  const session = await findValidSession(sessionId)
  if (!session) {
    const response = NextResponse.json(
      { success: false, error: '유효하지 않은 세션입니다.' },
      { status: 401 }
    )
    response.cookies.delete(SSO_SESSION_COOKIE_NAME)
    return response
  }

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
  })
}
