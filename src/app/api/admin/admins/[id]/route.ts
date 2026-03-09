import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireRole(request, [UserRole.SUPER_ADMIN])
    const { id } = await params

    // 자기 자신은 삭제 불가
    if (id === payload.sub) {
      return NextResponse.json(
        { success: false, error: '자기 자신을 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    const admin = await prisma.user.findUnique({ where: { id } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
