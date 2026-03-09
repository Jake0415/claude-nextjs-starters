import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleAuthError } from '@/lib/auth/guard'
import { getUserLoginLogs } from '@/lib/auth/login-log'

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request)

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const result = await getUserLoginLogs(payload.sub, page, limit)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAuthError(error)
  }
}
