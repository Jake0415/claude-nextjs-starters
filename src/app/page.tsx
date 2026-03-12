import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'

export default async function Home() {
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    redirect('/setup')
  }
  redirect('/login')
}
