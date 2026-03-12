'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Shield, Link2, Clock, Mail, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGet } from '@/lib/api/client'

interface StatsResponse {
  stats: {
    totalUsers: number
    activeUsers: number
    totalAdmins: number
    totalApps: number
    activeSessions: number
    pendingInvitations: number
  }
  recentUsers: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    createdBy: { name: string } | null
  }[]
  recentFailures: {
    id: string
    email: string
    action: string
    ipAddress: string | null
    appUrl: string | null
    createdAt: string
    user: { name: string; email: string }
  }[]
}

const statConfig = [
  {
    key: 'totalUsers',
    label: '전체 사용자',
    icon: Users,
    color: 'text-primary',
  },
  {
    key: 'activeUsers',
    label: '활성 사용자',
    icon: Users,
    color: 'text-emerald-500',
  },
  {
    key: 'totalAdmins',
    label: 'Admin',
    icon: Shield,
    color: 'text-violet-500',
  },
  { key: 'totalApps', label: '등록 앱', icon: Link2, color: 'text-amber-500' },
  {
    key: 'activeSessions',
    label: '활성 세션',
    icon: Clock,
    color: 'text-sky-500',
  },
  {
    key: 'pendingInvitations',
    label: '대기 중 초대',
    icon: Mail,
    color: 'text-rose-500',
  },
] as const

export default function DashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<StatsResponse>('/api/admin/stats')
      .then(res => {
        if (res.success && res.data) setData(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground text-sm">SSO 서버 현황 요약</p>
        </div>
        <p className="text-muted-foreground">
          통계 데이터를 불러올 수 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm">SSO 서버 현황 요약</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statConfig.map(stat => (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', stat.color)}>
                {data.stats[stat.key]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 최근 생성 계정 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 생성 계정</CardTitle>
            <CardDescription>최근 등록된 사용자 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground text-center"
                    >
                      등록된 사용자가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'ADMIN' ? 'default' : 'secondary'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 로그인 실패 로그 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 로그인 실패</CardTitle>
            <CardDescription>실패한 로그인 시도 기록</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentFailures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground text-center"
                    >
                      실패한 로그인 시도가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentFailures.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.email}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(log.createdAt).toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
