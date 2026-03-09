import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { allowedRedirectSchema } from '@/lib/schemas/auth'
import { UserRole } from '@/lib/types/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const redirects = await prisma.allowedRedirect.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: redirects })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const body = await request.json()
    const parsed = allowedRedirectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.allowedRedirect.findUnique({
      where: { url: parsed.data.url },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 URL입니다.' },
        { status: 409 }
      )
    }

    const redirect = await prisma.allowedRedirect.create({
      data: parsed.data,
    })

    return NextResponse.json({ success: true, data: redirect }, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
