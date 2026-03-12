import { NextRequest, NextResponse } from 'next/server'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { sendTestMail } from '@/lib/mail/smtp'
import { getSmtpConfig } from '@/lib/mail/smtp'

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN])

    const body = await request.json()
    const { email } = body as { email: string }

    if (!email) {
      return NextResponse.json(
        { success: false, error: '수신 이메일을 입력해 주세요.' },
        { status: 400 }
      )
    }

    const config = await getSmtpConfig()
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'SMTP 설정을 먼저 저장해 주세요.' },
        { status: 400 }
      )
    }

    await sendTestMail(email, config)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: `메일 발송 실패: ${error.message}` },
        { status: 500 }
      )
    }
    return handleAuthError(error)
  }
}
