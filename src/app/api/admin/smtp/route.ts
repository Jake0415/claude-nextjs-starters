import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { smtpConfigSchema } from '@/lib/schemas/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const config = await prisma.smtpConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        host: true,
        port: true,
        username: true,
        secure: true,
        fromName: true,
        fromEmail: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const parsed = smtpConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // 기존 설정 삭제 후 새로 생성 (단일 설정)
    await prisma.smtpConfig.deleteMany()

    const config = await prisma.smtpConfig.create({
      data: {
        ...parsed.data,
        updatedById: payload.sub,
      },
    })

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    return handleAuthError(error)
  }
}
