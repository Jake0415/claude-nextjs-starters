import { Metadata } from 'next'
import { InviteForm } from '@/components/auth/invite-form'

export const metadata: Metadata = {
  title: '초대 수락 - MHSSO',
  description: '초대받은 이메일로 계정을 생성합니다',
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Phase 6에서 토큰 검증 API 연동 예정
  // 더미 데이터
  const inviteEmail = 'invited@company.com'

  return <InviteForm email={inviteEmail} token={token} />
}
