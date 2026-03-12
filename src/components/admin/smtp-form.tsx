'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { smtpConfigSchema, type SmtpConfigInput } from '@/lib/schemas/auth'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { apiGet, apiPut, apiPost } from '@/lib/api/client'

export function SmtpForm() {
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)

  const form = useForm<SmtpConfigInput>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      host: '',
      port: 587,
      username: '',
      password: '',
      secure: true,
      fromName: '',
      fromEmail: '',
    },
  })

  // 기존 설정 로드
  useEffect(() => {
    apiGet<{
      host: string
      port: number
      username: string
      secure: boolean
      fromName: string
      fromEmail: string
    }>('/api/admin/smtp').then(res => {
      if (res.success && res.data) {
        form.reset({
          host: res.data.host,
          port: res.data.port,
          username: res.data.username,
          password: '', // 비밀번호는 보안상 다시 입력
          secure: res.data.secure,
          fromName: res.data.fromName,
          fromEmail: res.data.fromEmail,
        })
      }
    })
  }, [form])

  const onSubmit = async (data: SmtpConfigInput) => {
    const res = await apiPut('/api/admin/smtp', data)
    if (res.success) {
      toast.success('SMTP 설정이 저장되었습니다.')
    } else {
      toast.error(res.error || 'SMTP 설정 저장에 실패했습니다.')
    }
  }

  const handleTestSend = async () => {
    if (!testEmail) return
    setTesting(true)
    const res = await apiPost('/api/admin/smtp/test', { email: testEmail })
    setTesting(false)
    if (res.success) {
      toast.success('테스트 메일이 발송되었습니다.')
    } else {
      toast.error(res.error || '테스트 메일 발송에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP 호스트</FormLabel>
                  <FormControl>
                    <Input placeholder="smtp.gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>포트</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="587"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용자명</FormLabel>
                  <FormControl>
                    <Input placeholder="noreply@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="앱 비밀번호"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="secure"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>TLS/SSL 사용</FormLabel>
                  <FormDescription>보안 연결을 사용합니다</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발신자 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="MHSSO AI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발신자 이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="noreply@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '설정 저장'
            )}
          </Button>
        </form>
      </Form>

      <Separator />

      {/* 테스트 메일 발송 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">테스트 메일 발송</h3>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="테스트 수신 이메일"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleTestSend}
            disabled={!testEmail || testing}
          >
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            테스트 발송
          </Button>
        </div>
      </div>
    </div>
  )
}
