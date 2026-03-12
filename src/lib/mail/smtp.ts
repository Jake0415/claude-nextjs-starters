import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { prisma } from '@/lib/db/prisma'

// 포트 465는 직접 SSL, 그 외(587 등)는 STARTTLS 사용
function resolveSecure(port: number): boolean {
  return port === 465
}

export async function getSmtpConfig() {
  return prisma.smtpConfig.findFirst({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createTransporter(): Promise<Transporter | null> {
  const config = await getSmtpConfig()
  if (!config) return null

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: resolveSecure(config.port),
    auth: {
      user: config.username,
      pass: config.password,
    },
  })
}

export async function sendMail(to: string, subject: string, html: string) {
  const config = await getSmtpConfig()
  if (!config) throw new Error('SMTP 설정이 되어있지 않습니다.')

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: resolveSecure(config.port),
    auth: {
      user: config.username,
      pass: config.password,
    },
  })

  return transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    html,
  })
}

export async function testSmtpConnection(config: {
  host: string
  port: number
  username: string
  password: string
  secure: boolean
}) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: resolveSecure(config.port),
    auth: {
      user: config.username,
      pass: config.password,
    },
  })

  await transporter.verify()
  return true
}

export async function sendTestMail(
  to: string,
  config: {
    host: string
    port: number
    username: string
    password: string
    secure: boolean
    fromName: string
    fromEmail: string
  }
) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: resolveSecure(config.port),
    auth: {
      user: config.username,
      pass: config.password,
    },
  })

  return transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject: '[MHSSO] SMTP 테스트 메일',
    html: '<h1>MHSSO SMTP 테스트</h1><p>이 메일이 정상적으로 수신되었다면 SMTP 설정이 올바릅니다.</p>',
  })
}
