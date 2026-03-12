'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { inviteUserSchema, type InviteUserInput } from '@/lib/schemas/auth'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiPost } from '@/lib/api/client'

interface InviteUserFormProps {
  onSuccess?: () => void
  showRoleSelect?: boolean
  availableRoles?: ('USER' | 'ADMIN')[]
  defaultRole?: 'USER' | 'ADMIN'
  apiEndpoint?: string
}

export function InviteUserForm({
  onSuccess,
  showRoleSelect = false,
  availableRoles = ['USER'],
  defaultRole = 'USER',
  apiEndpoint = '/api/admin/invitations',
}: InviteUserFormProps) {
  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: defaultRole,
    },
  })

  const onSubmit = async (data: InviteUserInput) => {
    const res = await apiPost<{ inviteUrl?: string }>(apiEndpoint, data)
    if (res.success) {
      // 초대 URL이 있으면 복사 가능하도록 표시
      const inviteUrl = res.data?.inviteUrl
      if (inviteUrl) {
        try {
          await navigator.clipboard.writeText(inviteUrl)
          toast.success('초대가 생성되었습니다.', {
            description: '초대 링크가 클립보드에 복사되었습니다.',
            duration: 5000,
          })
        } catch {
          toast.success('초대가 생성되었습니다.', {
            description: `초대 링크: ${inviteUrl}`,
            duration: 10000,
          })
        }
      } else {
        toast.success('초대가 발송되었습니다.')
      }
      form.reset({ email: '', role: defaultRole })
      onSuccess?.()
    } else {
      toast.error(res.error || '초대 발송에 실패했습니다.')
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: '관리자 (ADMIN)',
    USER: '일반 사용자 (USER)',
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>초대할 이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showRoleSelect && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>부여할 역할</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="역할을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role] || role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              발송 중...
            </>
          ) : (
            '초대 발송'
          )}
        </Button>
      </form>
    </Form>
  )
}
