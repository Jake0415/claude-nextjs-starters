'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
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

export function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectUrl = searchParams.get('redirect_url')
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, redirectUrl }),
      })
      const result = await res.json()

      if (!result.success) {
        toast.error(result.error || '로그인에 실패했습니다.')
        return
      }

      toast.success('로그인 성공')

      // 외부 앱 SSO 리다이렉트
      if (result.data.code && result.data.redirectUrl !== '/dashboard') {
        const url = new URL(result.data.redirectUrl)
        url.searchParams.set('code', result.data.code)
        window.location.href = url.toString()
        return
      }

      router.push(result.data.redirectUrl || '/dashboard')
    } catch {
      toast.error('서버 연결에 실패했습니다.')
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          MHSSO AI
        </CardTitle>
        <CardDescription className="text-center">
          SSO 계정에 로그인하여 서비스를 이용하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        {redirectUrl && (
          <div className="bg-muted mb-4 rounded-md p-3 text-sm">
            외부 앱에서 인증을 요청했습니다. 로그인 후 자동으로 이동합니다.
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
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
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
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

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
