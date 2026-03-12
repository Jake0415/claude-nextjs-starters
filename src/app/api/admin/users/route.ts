import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { createUserSchema, toggleActiveSchema } from '@/lib/schemas/auth'
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

// 사용자 활성화/비활성화 (SUPER_ADMIN 전용)
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const parsed = toggleActiveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { id, isActive } = parsed.data

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Super Admin은 변경할 수 없습니다.' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    })

    // 비활성화 시 세션/토큰 즉시 무효화
    if (!isActive) {
      await prisma.$transaction([
        prisma.ssoSession.deleteMany({ where: { userId: id } }),
        prisma.refreshToken.updateMany({
          where: { userId: id },
          data: { isRevoked: true },
        }),
      ])
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return handleAuthError(error)
  }
}
