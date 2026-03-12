export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginResponseData {
  redirectUrl: string
  code: string
}

export interface TokenResponseData {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshResponseData {
  accessToken: string
  expiresIn: number
}

export interface MeResponseData {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  profileImage: string | null
}

export interface JwtAccessPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  type: 'access'
}

export interface JwtRefreshPayload {
  sub: string
  jti: string
  type: 'refresh'
}

export interface StatsData {
  totalUsers: number
  activeUsers: number
  totalAdmins: number
  totalApps: number
  activeSessions: number
  pendingInvitations: number
}
