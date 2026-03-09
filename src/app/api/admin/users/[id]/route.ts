import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { updateUserSchema } from '@/lib/schemas/auth'
import { UserRole } from '@/lib/types/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])
    const { id } = await params

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, isActive, password } = parsed.data

    // 이메일 변경 시 중복 확인
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: '이미 등록된 이메일입니다.' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) updateData.hashedPassword = await hashPassword(password)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])
    const { id } = await params

    // 비활성화 처리 (소프트 삭제)
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
