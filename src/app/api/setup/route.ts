import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { setupSchema } from '@/lib/schemas/auth'

export async function GET() {
  const userCount = await prisma.user.count()
  return NextResponse.json({
    success: true,
    data: { needsSetup: userCount === 0 },
  })
}

export async function POST(request: Request) {
  // DB에 사용자가 이미 있으면 차단
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    return NextResponse.json(
      { success: false, error: '이미 초기 설정이 완료되었습니다.' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const parsed = setupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data
  const hashedPassword = await hashPassword(password)

  const superAdmin = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: 'SUPER_ADMIN',
    },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json({ success: true, data: superAdmin }, { status: 201 })
}
