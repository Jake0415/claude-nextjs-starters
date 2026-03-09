import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { createUserSchema } from '@/lib/schemas/auth'
import { UserRole } from '@/lib/types/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const parsed = createUserSchema.safeParse({ ...body, role: 'ADMIN' })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: 'ADMIN',
        createdById: payload.sub,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: admin }, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
