import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { InviteForm } from '@/components/auth/invite-form'
import { findValidInvitation } from '@/lib/auth/invitation'

export const metadata: Metadata = {
  title: '초대 수락 - MHSSO',
  description: '초대받은 이메일로 계정을 생성합니다',
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  const cookieStore = await cookies()
  if (cookieStore.get('sso_session')?.value) {
    redirect('/dashboard')
  }

  const { token } = await params

  const invitation = await findValidInvitation(token)
  if (!invitation) {
    notFound()
  }

  return (
    <InviteForm email={invitation.email} token={token} role={invitation.role} />
  )
}
