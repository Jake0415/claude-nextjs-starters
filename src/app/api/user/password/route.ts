import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest, handleAuthError } from '@/lib/auth/guard'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { changePasswordSchema } from '@/lib/schemas/auth'

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request)

    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const isValid = await verifyPassword(currentPassword, user.hashedPassword)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: payload.sub },
      data: { hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
