import { NextRequest, NextResponse } from 'next/server'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { getLoginLogs } from '@/lib/auth/login-log'
import { UserRole } from '@/lib/types/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action') || undefined
    const userId = searchParams.get('userId') || undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const result = await getLoginLogs({
      page,
      limit,
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAuthError(error)
  }
}
