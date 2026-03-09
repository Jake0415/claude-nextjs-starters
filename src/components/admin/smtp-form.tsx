'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'

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

export function SmtpForm() {
  const [testEmail, setTestEmail] = useState('')

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

  const onSubmit = (data: SmtpConfigInput) => {
    // Phase 6에서 API 연동 예정
    console.log('SMTP 설정 데이터:', data)
  }

  const handleTestSend = () => {
    // Phase 6에서 API 연동 예정
    console.log('테스트 메일 발송:', testEmail)
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
            disabled={!testEmail}
          >
            <Send className="mr-2 h-4 w-4" />
            테스트 발송
          </Button>
        </div>
      </div>
    </div>
  )
}
