import { Metadata } from 'next'
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
import { Users, Shield, Link2, Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: '대시보드 - MHSSO',
  description: 'SSO 서버 대시보드',
}

// 더미 통계
const stats = [
  { label: '전체 사용자', value: '24', icon: Users, color: 'text-primary' },
  { label: '활성 사용자', value: '18', icon: Users, color: 'text-emerald-500' },
  { label: 'Admin', value: '3', icon: Shield, color: 'text-violet-500' },
  { label: '등록 앱', value: '5', icon: Link2, color: 'text-amber-500' },
  { label: '활성 세션', value: '12', icon: Clock, color: 'text-sky-500' },
  { label: '대기 중 초대', value: '2', icon: Mail, color: 'text-rose-500' },
]

// 더미 최근 계정
const recentUsers = [
  {
    id: '1',
    name: '김철수',
    email: 'chulsu@company.com',
    role: 'USER',
    createdAt: '2026-03-05',
  },
  {
    id: '2',
    name: '이영희',
    email: 'younghee@company.com',
    role: 'USER',
    createdAt: '2026-03-04',
  },
  {
    id: '3',
    name: '박관리',
    email: 'admin2@company.com',
    role: 'ADMIN',
    createdAt: '2026-03-03',
  },
]

// 더미 로그인 로그
const loginLogs = [
  {
    id: '1',
    email: 'chulsu@company.com',
    success: true,
    ip: '192.168.1.10',
    app: 'HR 시스템',
    createdAt: '2026-03-06 10:30',
  },
  {
    id: '2',
    email: 'unknown@test.com',
    success: false,
    ip: '10.0.0.55',
    app: '-',
    createdAt: '2026-03-06 09:15',
  },
  {
    id: '3',
    email: 'younghee@company.com',
    success: true,
    ip: '192.168.1.20',
    app: '프로젝트 관리',
    createdAt: '2026-03-06 08:45',
  },
  {
    id: '4',
    email: 'admin2@company.com',
    success: true,
    ip: '192.168.1.5',
    app: 'MHSSO',
    createdAt: '2026-03-05 17:30',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm">SSO 서버 현황 요약</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', stat.color)}>
                {stat.value}
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
                {recentUsers.map(user => (
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
                    <TableCell className="text-sm">{user.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 로그인 로그 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 로그인 로그</CardTitle>
            <CardDescription>성공 및 실패 로그인 기록</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.email}</p>
                        <p className="text-muted-foreground text-xs">
                          {log.ip} / {log.app}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? '성공' : '실패'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{log.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
