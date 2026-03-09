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
import { PasswordForm } from '@/components/profile/password-form'

export const metadata: Metadata = {
  title: '내 정보 - MHSSO',
  description: '내 정보 확인 및 비밀번호 변경',
}

// 더미 사용자 정보
const user = {
  name: 'Admin',
  email: 'admin@company.com',
  role: 'SUPER_ADMIN',
  createdAt: '2026-03-01',
  lastLogin: '2026-03-06 10:30',
}

// 더미 내 로그인 기록
const myLoginLogs = [
  {
    id: '1',
    success: true,
    ip: '192.168.1.5',
    userAgent: 'Chrome 130 / Windows',
    createdAt: '2026-03-06 10:30',
  },
  {
    id: '2',
    success: true,
    ip: '192.168.1.5',
    userAgent: 'Chrome 130 / Windows',
    createdAt: '2026-03-05 09:00',
  },
  {
    id: '3',
    success: false,
    ip: '10.0.0.99',
    userAgent: 'Firefox 125 / Linux',
    createdAt: '2026-03-04 22:15',
  },
]

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">내 정보</h1>
        <p className="text-muted-foreground text-sm">
          계정 정보 확인 및 비밀번호 변경
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 내 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">이름</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">이메일</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">역할</p>
                <Badge>{user.role}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">가입일</p>
                <p className="font-medium">{user.createdAt}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-sm">최근 로그인</p>
                <p className="font-medium">{user.lastLogin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>
              보안을 위해 주기적으로 비밀번호를 변경하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>

      {/* 내 로그인 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>내 로그인 기록</CardTitle>
          <CardDescription>최근 로그인 활동</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상태</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>브라우저</TableHead>
                <TableHead>시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLoginLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={log.success ? 'default' : 'destructive'}>
                      {log.success ? '성공' : '실패'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                  <TableCell className="text-sm">{log.userAgent}</TableCell>
                  <TableCell className="text-sm">{log.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
