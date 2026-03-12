'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  allowedRedirectSchema,
  type AllowedRedirectInput,
} from '@/lib/schemas/auth'
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
import { apiPost } from '@/lib/api/client'

interface RedirectFormProps {
  onSuccess?: () => void
}

export function RedirectForm({ onSuccess }: RedirectFormProps) {
  const form = useForm<AllowedRedirectInput>({
    resolver: zodResolver(allowedRedirectSchema),
    defaultValues: {
      name: '',
      url: '',
    },
  })

  const onSubmit = async (data: AllowedRedirectInput) => {
    const res = await apiPost('/api/admin/redirects', data)
    if (res.success) {
      toast.success('URL이 등록되었습니다.')
      form.reset()
      onSuccess?.()
    } else {
      toast.error(res.error || 'URL 등록에 실패했습니다.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>앱 이름</FormLabel>
              <FormControl>
                <Input placeholder="HR 시스템" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>콜백 URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://hr.company.com/callback"
                  {...field}
                />
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
              등록 중...
            </>
          ) : (
            '등록'
          )}
        </Button>
      </form>
    </Form>
  )
}
