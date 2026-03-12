'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, Mail, Shield } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { acceptInviteSchema, type AcceptInviteInput } from '@/lib/schemas/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface InviteFormProps {
  email: string
  token: string
  role?: string
}

const roleLabels: Record<string, string> = {
  ADMIN: '관리자',
  USER: '일반 사용자',
}

export function InviteForm({ email, token, role }: InviteFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: AcceptInviteInput) => {
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!result.success) {
        toast.error(result.error || '계정 생성에 실패했습니다.')
        return
      }

      toast.success('계정이 성공적으로 생성되었습니다!')
      const redirectUrl = result.data?.redirectUrl
      router.push(redirectUrl?.startsWith('/') ? redirectUrl : '/dashboard')
    } catch {
      toast.error('서버 연결에 실패했습니다.')
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          계정 생성
        </CardTitle>
        <CardDescription className="text-center">
          초대받은 이메일로 새 계정을 등록합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 초대 정보 */}
        <div className="bg-muted mb-6 space-y-2 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">이메일</span>
            <span className="ml-auto font-medium">{email}</span>
          </div>
          {role && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">역할</span>
              <span className="ml-auto font-medium">
                {roleLabels[role] || role}
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="이름을 입력하세요"
                      autoComplete="name"
                      {...field}
                    />
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
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8자 이상 입력하세요"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 다시 입력하세요"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  계정 생성 중...
                </>
              ) : (
                '계정 생성'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
