'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

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

interface InviteUserFormProps {
  onSuccess?: () => void
}

export function InviteUserForm({ onSuccess }: InviteUserFormProps) {
  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: InviteUserInput) => {
    // Phase 6에서 API 연동 예정
    console.log('사용자 초대 데이터:', data)
    form.reset()
    onSuccess?.()
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
