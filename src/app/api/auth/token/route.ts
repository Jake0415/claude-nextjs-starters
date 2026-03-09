import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { exchangeAuthorizationCode } from '@/lib/auth/authorization-code'
import {
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_EXPIRES_SECONDS,
} from '@/lib/auth/jwt'
import { createRefreshToken } from '@/lib/auth/tokens'
import { getRequestMeta } from '@/lib/auth/guard'
import type { UserRole } from '@/lib/types/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { code } = body

  if (!code) {
    return NextResponse.json(
      { success: false, error: '인가 코드가 필요합니다.' },
      { status: 400 }
    )
  }

  // 인가 코드 검증
  const result = await exchangeAuthorizationCode(code)
  if (!result) {
    return NextResponse.json(
      { success: false, error: '유효하지 않거나 만료된 인가 코드입니다.' },
      { status: 401 }
    )
  }

  // 사용자 조회
  const user = await prisma.user.findUnique({ where: { id: result.userId } })
  if (!user || !user.isActive) {
    return NextResponse.json(
      { success: false, error: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const { userAgent, ipAddress } = getRequestMeta(request)

  // Refresh Token 생성 (DB 저장)
  const { token: refreshTokenValue, id: refreshTokenId } =
    await createRefreshToken(user.id, userAgent, ipAddress)

  // JWT 발급
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    }),
    signRefreshToken({ sub: user.id, jti: refreshTokenId }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      refreshTokenValue,
      expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
    },
  })
}
