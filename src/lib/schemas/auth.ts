import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 주소를 입력해 주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해 주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  email: z
    .string()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 주소를 입력해 주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(100, '비밀번호는 100자 이하여야 합니다.'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const setupSchema = z
  .object({
    name: z
      .string()
      .min(1, '이름을 입력해 주세요.')
      .max(50, '이름은 50자 이하여야 합니다.'),
    email: z
      .string()
      .min(1, '이메일을 입력해 주세요.')
      .email('올바른 이메일 주소를 입력해 주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자 이하여야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

export type SetupInput = z.infer<typeof setupSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요.'),
    newPassword: z
      .string()
      .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자 이하여야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const allowedRedirectSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .max(100, '이름은 100자 이하여야 합니다.'),
  url: z
    .string()
    .min(1, 'URL을 입력해 주세요.')
    .url('올바른 URL을 입력해 주세요.'),
})

export type AllowedRedirectInput = z.infer<typeof allowedRedirectSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const acceptInviteSchema = z
  .object({
    name: z
      .string()
      .min(1, '이름을 입력해 주세요.')
      .max(50, '이름은 50자 이하여야 합니다.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자 이하여야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

export const toggleActiveSchema = z.object({
  id: z.string().min(1, 'ID가 필요합니다.'),
  isActive: z.boolean(),
})

export type ToggleActiveInput = z.infer<typeof toggleActiveSchema>

export const inviteUserSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 주소를 입력해 주세요.'),
  role: z.enum(['USER', 'ADMIN']),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>

export const smtpConfigSchema = z.object({
  host: z.string().min(1, 'SMTP 호스트를 입력해 주세요.'),
  port: z
    .number()
    .min(1, '포트 번호를 입력해 주세요.')
    .max(65535, '올바른 포트 번호를 입력해 주세요.'),
  username: z.string().min(1, '사용자명을 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
  secure: z.boolean(),
  fromName: z.string().min(1, '발신자 이름을 입력해 주세요.'),
  fromEmail: z
    .string()
    .min(1, '발신자 이메일을 입력해 주세요.')
    .email('올바른 이메일 주소를 입력해 주세요.'),
})

export type SmtpConfigInput = z.infer<typeof smtpConfigSchema>
