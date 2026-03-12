import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { cancelInvitation } from '@/lib/auth/invitation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const { id } = await params
    await cancelInvitation(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleAuthError(error)
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return handleAuthError(error)
  }
}
