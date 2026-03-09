import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { createUserSchema } from '@/lib/schemas/auth'
import { UserRole } from '@/lib/types/auth'

export async function GET(request: NextRequest) {
  try {
    const payload = await requireRole(request, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ])

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const search = request.nextUrl.searchParams.get('search') || ''

    const where = {
      role: 'USER' as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          createdBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireRole(request, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ])

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = parsed.data

    // Admin은 USER만 생성 가능
    if (payload.role === UserRole.ADMIN && role === 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin 계정은 Super Admin만 생성할 수 있습니다.',
        },
        { status: 403 }
      )
    }

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
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

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
