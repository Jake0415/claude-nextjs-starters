'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Shield,
  Link2,
  Mail,
  User,
  LogOut,
  Menu,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useSession } from '@/hooks/use-session'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  {
    name: '사용자 관리',
    href: '/admin/users',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Admin 관리',
    href: '/admin/admins',
    icon: Shield,
    roles: ['SUPER_ADMIN'],
  },
  {
    name: '허용 URL',
    href: '/admin/redirects',
    icon: Link2,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'SMTP 설정',
    href: '/admin/smtp',
    icon: Mail,
    roles: ['SUPER_ADMIN'],
  },
  { name: '내 정보', href: '/profile', icon: User },
]

function NavItems({
  pathname,
  userRole,
  onNavigate,
}: {
  pathname: string
  userRole: string
  onNavigate?: () => void
}) {
  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(userRole)
  )

  return (
    <>
      {filteredNav.map(item => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </>
  )
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, loading, logout } = useSession()

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* 데스크탑 사이드바 */}
      <aside className="bg-sidebar text-sidebar-foreground hidden w-64 flex-shrink-0 md:block">
        <div className="flex h-full flex-col">
          <div className="border-sidebar-border border-b p-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="MHSSO AI"
                width={28}
                height={28}
                className="flex-shrink-0"
              />
              <span className="text-sidebar-foreground text-xl font-bold">
                MHSSO AI
              </span>
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-7 w-7">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sidebar-foreground/60 text-sm">
                {user.name} ({user.role})
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <NavItems pathname={pathname} userRole={user.role} />
          </nav>

          <div className="border-sidebar-border space-y-2 border-t p-4">
            <Link
              href="/docs"
              target="_blank"
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              SSO 연동 가이드
            </Link>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* 모바일 헤더 + 사이드바 */}
      <div className="flex flex-1 flex-col">
        <header className="bg-card border-border flex items-center justify-between border-b p-4 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MHSSO AI" width={24} height={24} />
            <span className="text-lg font-bold">MHSSO AI</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-sidebar text-sidebar-foreground w-64 p-0"
            >
              <div className="flex h-full flex-col">
                <div className="border-sidebar-border border-b p-6">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/logo.svg"
                      alt="MHSSO AI"
                      width={28}
                      height={28}
                    />
                    <span className="text-sidebar-foreground text-xl font-bold">
                      MHSSO AI
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sidebar-foreground/60 text-sm">
                      {user.name} ({user.role})
                    </p>
                  </div>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  <NavItems
                    pathname={pathname}
                    userRole={user.role}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </nav>
                <div className="border-sidebar-border space-y-2 border-t p-4">
                  <Link
                    href="/docs"
                    target="_blank"
                    onClick={() => setMobileOpen(false)}
                    className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    SSO 연동 가이드
                  </Link>
                  <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
