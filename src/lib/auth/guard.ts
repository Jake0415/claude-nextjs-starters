import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './jwt'
import type { JwtAccessPayload, UserRole } from '@/lib/types/auth'

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function authenticateRequest(
  request: NextRequest
): Promise<JwtAccessPayload> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('인증 토큰이 필요합니다.')
  }

  const token = authHeader.slice(7)
  try {
    return await verifyAccessToken(token)
  } catch {
    throw new AuthError('유효하지 않거나 만료된 토큰입니다.')
  }
}

export async function requireRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<JwtAccessPayload> {
  const payload = await authenticateRequest(request)

  if (!roles.includes(payload.role)) {
    throw new AuthError('접근 권한이 없습니다.', 403)
  }

  return payload
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    )
  }
  return NextResponse.json(
    { success: false, error: '서버 오류가 발생했습니다.' },
    { status: 500 }
  )
}

// 요청에서 IP, User-Agent 추출
export function getRequestMeta(request: NextRequest) {
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined,
  }
}
