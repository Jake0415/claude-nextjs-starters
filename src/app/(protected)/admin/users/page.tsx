'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { InviteUserForm } from '@/components/admin/invite-user-form'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { useSession } from '@/hooks/use-session'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface InvitationData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  expiresAt: string
  invitedBy: { name: string; email: string }
}

const statusMap: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  PENDING: { label: '대기 중', variant: 'outline' },
  ACCEPTED: { label: '수락됨', variant: 'default' },
  CANCELLED: { label: '취소됨', variant: 'secondary' },
  EXPIRED: { label: '만료됨', variant: 'destructive' },
}

export default function UsersPage() {
  const { user: sessionUser } = useSession()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [loading, setLoading] = useState(true)
  const isSuperAdmin = sessionUser?.role === 'SUPER_ADMIN'

  const fetchData = useCallback(async () => {
    const [usersRes, invRes] = await Promise.all([
      apiGet<{ users: UserData[] }>('/api/admin/users'),
      apiGet<InvitationData[]>('/api/admin/invitations'),
    ])
    if (usersRes.success && usersRes.data) setUsers(usersRes.data.users)
    if (invRes.success && invRes.data) setInvitations(invRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleResend = async (id: string) => {
    const res = await apiPost(`/api/admin/invitations/${id}/resend`)
    if (res.success) {
      toast.success('초대가 재발송되었습니다.')
      fetchData()
    } else {
      toast.error(res.error || '재발송에 실패했습니다.')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('초대를 취소하시겠습니까?')) return

    const res = await apiPost(`/api/admin/invitations/${id}/cancel`)
    if (res.success) {
      toast.success('초대가 취소되었습니다.')
      fetchData()
    } else {
      toast.error(res.error || '취소에 실패했습니다.')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const res = await apiPatch('/api/admin/users', { id, isActive: !isActive })
    if (res.success) {
      toast.success(isActive ? '비활성화되었습니다.' : '활성화되었습니다.')
      fetchData()
    } else {
      toast.error(res.error || '상태 변경에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground text-sm">
            사용자 목록 관리 및 초대 발송
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              사용자 초대
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사용자 초대</DialogTitle>
              <DialogDescription>
                이메일을 입력하여 초대장을 발송합니다. 초대받은 사용자는 링크를
                통해 계정을 생성할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <InviteUserForm
              showRoleSelect
              availableRoles={isSuperAdmin ? ['USER', 'ADMIN'] : ['USER']}
              defaultRole="USER"
              onSuccess={() => {
                setInviteOpen(false)
                fetchData()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">사용자 목록</TabsTrigger>
          <TabsTrigger value="invitations">초대 현황</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>
                등록된 전체 사용자 ({users.length}명)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입일</TableHead>
                    {isSuperAdmin && <TableHead>작업</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isSuperAdmin ? 6 : 5}
                        className="text-muted-foreground text-center"
                      >
                        등록된 사용자가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'default' : 'destructive'}
                          >
                            {user.isActive ? '활성' : '비활성'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            {user.role !== 'SUPER_ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={
                                  user.isActive ? 'text-destructive' : ''
                                }
                                onClick={() =>
                                  handleToggleActive(user.id, user.isActive)
                                }
                              >
                                {user.isActive ? '비활성화' : '활성화'}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>초대 현황</CardTitle>
              <CardDescription>
                발송된 초대장 목록 ({invitations.length}건)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>초대자</TableHead>
                    <TableHead>발송일</TableHead>
                    <TableHead>만료일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground text-center"
                      >
                        발송된 초대가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map(inv => {
                      const status = statusMap[inv.status] || {
                        label: inv.status,
                        variant: 'secondary' as const,
                      }
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">
                            {inv.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inv.role === 'ADMIN' ? 'default' : 'secondary'
                              }
                            >
                              {inv.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {inv.invitedBy.email}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(inv.createdAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(inv.expiresAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </TableCell>
                          <TableCell>
                            {inv.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResend(inv.id)}
                                >
                                  재발송
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleCancel(inv.id)}
                                >
                                  취소
                                </Button>
                              </div>
                            )}
                            {inv.status === 'EXPIRED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(inv.id)}
                              >
                                재발송
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
