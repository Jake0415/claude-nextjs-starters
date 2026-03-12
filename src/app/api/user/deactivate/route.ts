import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest, handleAuthError } from '@/lib/auth/guard'

// 자기 계정 비활성화
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request)

    // SUPER_ADMIN은 자기 비활성화 불가 (시스템 보호)
    if (payload.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Super Admin 계정은 비활성화할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 비활성화 + 세션/토큰 무효화를 트랜잭션으로 처리
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payload.sub },
        data: { isActive: false },
      }),
      prisma.ssoSession.deleteMany({
        where: { userId: payload.sub },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { isRevoked: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
