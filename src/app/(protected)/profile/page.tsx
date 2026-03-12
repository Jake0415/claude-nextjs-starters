'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { Loader2, AlertTriangle } from 'lucide-react'
import { PasswordForm } from '@/components/profile/password-form'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { apiGet, apiPost } from '@/lib/api/client'
import { toast } from 'sonner'

interface LoginLogData {
  id: string
  action: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { user, refreshSession, logout } = useSession()
  const [loginLogs, setLoginLogs] = useState<LoginLogData[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [deactivating, setDeactivating] = useState(false)

  const handleDeactivate = useCallback(async () => {
    setDeactivating(true)
    const res = await apiPost('/api/user/deactivate')
    if (res.success) {
      toast.success('계정이 비활성화되었습니다.')
      await logout()
    } else {
      toast.error(res.error || '계정 비활성화에 실패했습니다.')
      setDeactivating(false)
    }
  }, [logout])

  useEffect(() => {
    apiGet<{ logs: LoginLogData[] }>('/api/user/login-logs?limit=10')
      .then(res => {
        if (res.success && res.data) setLoginLogs(res.data.logs)
      })
      .finally(() => setLogsLoading(false))
  }, [])

  if (!user) return null

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
          <CardContent className="space-y-6">
            <ProfileImageUpload
              currentImage={user.profileImage}
              userName={user.name}
              onUpdate={refreshSession}
            />
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
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
                {loginLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      로그인 기록이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  loginLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant={
                            log.action === 'LOGIN_SUCCESS'
                              ? 'default'
                              : log.action === 'LOGOUT'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {log.action === 'LOGIN_SUCCESS'
                            ? '성공'
                            : log.action === 'LOGOUT'
                              ? '로그아웃'
                              : '실패'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {log.userAgent || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 계정 비활성화 (SUPER_ADMIN 제외) */}
      {user.role !== 'SUPER_ADMIN' && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              계정 비활성화
            </CardTitle>
            <CardDescription>
              계정을 비활성화하면 로그인이 불가능합니다. 관리자에게 문의하여
              다시 활성화할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deactivating}>
                  {deactivating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '계정 비활성화'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    계정을 비활성화하시겠습니까?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    계정이 비활성화되면 즉시 로그아웃되며, 이후 로그인이
                    불가능합니다. 다시 활성화하려면 관리자에게 문의해야 합니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    비활성화
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
