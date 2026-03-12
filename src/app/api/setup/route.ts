import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { setupSchema } from '@/lib/schemas/auth'
import {
  createSsoSession,
  SSO_SESSION_COOKIE_NAME,
  SSO_SESSION_MAX_AGE,
} from '@/lib/auth/session'
import { getRequestMeta } from '@/lib/auth/guard'

export async function GET() {
  const userCount = await prisma.user.count()
  return NextResponse.json({
    success: true,
    data: { needsSetup: userCount === 0 },
  })
}

export async function POST(request: NextRequest) {
  try {
    // DB에 사용자가 이미 있으면 차단
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: '이미 초기 설정이 완료되었습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = setupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const hashedPassword = await hashPassword(password)

    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: 'SUPER_ADMIN',
      },
      select: { id: true, email: true, name: true, role: true },
    })

    // 세션 생성 및 쿠키 설정 (setup 후 자동 로그인)
    const { userAgent, ipAddress } = getRequestMeta(request)
    const session = await createSsoSession(superAdmin.id, userAgent, ipAddress)

    const response = NextResponse.json(
      { success: true, data: superAdmin },
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
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: '초기 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
