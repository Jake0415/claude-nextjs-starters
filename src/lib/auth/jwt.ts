import { SignJWT, jwtVerify } from 'jose'
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
  UserRole,
} from '@/lib/types/auth'

const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

function getAccessSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
}

function getRefreshSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)
}

function getIssuer(): string {
  return process.env.JWT_ISSUER || 'mhsso-ai'
}

export async function signAccessToken(payload: {
  sub: string
  email: string
  name: string
  role: UserRole
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    type: 'access',
  } satisfies Omit<JwtAccessPayload, 'sub'>)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuer(getIssuer())
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(getAccessSecret())
}

export async function signRefreshToken(payload: {
  sub: string
  jti: string
}): Promise<string> {
  return new SignJWT({
    jti: payload.jti,
    type: 'refresh',
  } satisfies Omit<JwtRefreshPayload, 'sub'>)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuer(getIssuer())
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(getRefreshSecret())
}

export async function verifyAccessToken(
  token: string
): Promise<JwtAccessPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret(), {
    issuer: getIssuer(),
  })
  return {
    sub: payload.sub!,
    email: payload.email as string,
    name: payload.name as string,
    role: payload.role as UserRole,
    type: 'access',
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<JwtRefreshPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret(), {
    issuer: getIssuer(),
  })
  return {
    sub: payload.sub!,
    jti: payload.jti as string,
    type: 'refresh',
  }
}

export const ACCESS_TOKEN_EXPIRES_SECONDS = 15 * 60
export const REFRESH_TOKEN_EXPIRES_SECONDS = 7 * 24 * 60 * 60
