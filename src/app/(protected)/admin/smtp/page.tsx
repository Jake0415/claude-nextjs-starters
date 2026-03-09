import { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SmtpForm } from '@/components/admin/smtp-form'

export const metadata: Metadata = {
  title: 'SMTP 설정 - MHSSO',
  description: 'SMTP 메일 서버 설정',
}

export default function SmtpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMTP 설정</h1>
        <p className="text-muted-foreground text-sm">
          초대 메일 발송을 위한 SMTP 서버 설정 (Super Admin 전용)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>메일 서버 설정</CardTitle>
          <CardDescription>
            사용자 초대 메일 발송에 사용할 SMTP 서버를 설정합니다. 설정 저장 전
            테스트 발송으로 연결을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmtpForm />
        </CardContent>
      </Card>
    </div>
  )
}
