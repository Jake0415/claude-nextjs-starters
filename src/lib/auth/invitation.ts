import { prisma } from '@/lib/db/prisma'
import { v4 as uuidv4 } from 'uuid'

const INVITATION_EXPIRY_HOURS = 48

type InvitableRole = 'USER' | 'ADMIN'

export async function createInvitation(
  email: string,
  invitedById: string,
  role: InvitableRole = 'USER'
) {
  // 이미 등록된 사용자인지 확인
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error('이미 등록된 이메일입니다.')
  }

  // 이미 대기 중인 초대가 있으면 취소
  await prisma.invitation.updateMany({
    where: { email, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  })

  const token = uuidv4()
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000
  )

  return prisma.invitation.create({
    data: {
      email,
      token,
      role,
      invitedById,
      expiresAt,
    },
    include: {
      invitedBy: { select: { name: true, email: true } },
    },
  })
}

export async function findValidInvitation(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  })

  if (!invitation) return null
  if (invitation.status !== 'PENDING') return null
  if (invitation.expiresAt < new Date()) {
    // 만료 상태로 업데이트
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    })
    return null
  }

  return invitation
}

export async function acceptInvitation(token: string) {
  return prisma.invitation.update({
    where: { token },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  })
}

export async function cancelInvitation(id: string) {
  const invitation = await prisma.invitation.findUnique({ where: { id } })
  if (!invitation) throw new Error('초대를 찾을 수 없습니다.')
  if (invitation.status !== 'PENDING')
    throw new Error('대기 중인 초대만 취소할 수 있습니다.')

  return prisma.invitation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })
}

export async function resendInvitation(id: string) {
  const invitation = await prisma.invitation.findUnique({ where: { id } })
  if (!invitation) throw new Error('초대를 찾을 수 없습니다.')

  const newToken = uuidv4()
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000
  )

  return prisma.invitation.update({
    where: { id },
    data: {
      token: newToken,
      status: 'PENDING',
      expiresAt,
    },
    include: {
      invitedBy: { select: { name: true, email: true } },
    },
  })
}
