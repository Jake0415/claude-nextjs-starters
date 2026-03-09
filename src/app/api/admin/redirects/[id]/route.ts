import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])
    const { id } = await params

    await prisma.allowedRedirect.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
