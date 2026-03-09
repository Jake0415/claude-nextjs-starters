import { Metadata } from 'next'
import { SetupForm } from '@/components/auth/setup-form'

export const metadata: Metadata = {
  title: '초기 설정 - MHSSO',
  description: 'Super Admin 계정을 생성하여 SSO 서버를 초기화합니다',
}

export default function SetupPage() {
  return <SetupForm />
}
