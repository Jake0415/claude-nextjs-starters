import { NextRequest, NextResponse } from 'next/server'
import { requireRole, handleAuthError } from '@/lib/auth/guard'
import { UserRole } from '@/lib/types/auth'
import { resendInvitation } from '@/lib/auth/invitation'
import { sendMail } from '@/lib/mail/smtp'
import { invitationTemplate } from '@/lib/mail/templates'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.SUPER_ADMIN, UserRole.ADMIN])

    const { id } = await params
    const invitation = await resendInvitation(id)

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')
    const inviteUrl = `${appUrl}/invite/${invitation.token}`

    try {
      await sendMail(
        invitation.email,
        '[MHSSO] 계정 초대 (재발송)',
        invitationTemplate(inviteUrl, invitation.invitedBy.name)
      )
    } catch {
      // SMTP 미설정 시에도 성공 처리
    }

    return NextResponse.json({ success: true, data: { inviteUrl } })
  } catch (error) {
    return handleAuthError(error)
  }
}
