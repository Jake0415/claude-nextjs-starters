import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_EXPIRES_SECONDS,
} from '@/lib/auth/jwt'
import { findValidRefreshToken, rotateRefreshToken } from '@/lib/auth/tokens'
import { getRequestMeta } from '@/lib/auth/guard'
import type { UserRole } from '@/lib/types/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { refreshToken } = body

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'Refresh Token이 필요합니다.' },
      { status: 400 }
    )
  }

  // JWT 검증
  let payload
  try {
    payload = await verifyRefreshToken(refreshToken)
  } catch {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 Refresh Token입니다.' },
      { status: 401 }
    )
  }

  // DB에서 토큰 조회 (jti = token record id)
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true },
  })

  if (
    !tokenRecord ||
    tokenRecord.isRevoked ||
    tokenRecord.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { success: false, error: '만료되거나 무효화된 Refresh Token입니다.' },
      { status: 401 }
    )
  }

  const user = tokenRecord.user
  if (!user.isActive) {
    return NextResponse.json(
      { success: false, error: '비활성화된 계정입니다.' },
      { status: 403 }
    )
  }

  const { userAgent, ipAddress } = getRequestMeta(request)

  // Refresh Token Rotation
  const { token: newRefreshTokenValue, id: newRefreshTokenId } =
    await rotateRefreshToken(tokenRecord.token, user.id, userAgent, ipAddress)

  // 새 토큰 발급
  const [newAccessToken, newRefreshToken] = await Promise.all([
    signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    }),
    signRefreshToken({ sub: user.id, jti: newRefreshTokenId }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenValue: newRefreshTokenValue,
      expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
    },
  })
}
