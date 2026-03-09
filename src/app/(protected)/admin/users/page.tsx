'use client'

import { useState } from 'react'
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
import { UserPlus } from 'lucide-react'
import { InviteUserForm } from '@/components/admin/invite-user-form'

// 더미 사용자 목록
const users = [
  {
    id: '1',
    name: '김철수',
    email: 'chulsu@company.com',
    role: 'USER',
    isActive: true,
    createdAt: '2026-03-05',
  },
  {
    id: '2',
    name: '이영희',
    email: 'younghee@company.com',
    role: 'USER',
    isActive: true,
    createdAt: '2026-03-04',
  },
  {
    id: '3',
    name: '박비활성',
    email: 'inactive@company.com',
    role: 'USER',
    isActive: false,
    createdAt: '2026-02-20',
  },
]

// 더미 초대 현황
const invitations = [
  {
    id: '1',
    email: 'newuser1@company.com',
    status: 'PENDING',
    invitedBy: 'admin@company.com',
    createdAt: '2026-03-06',
    expiresAt: '2026-03-08',
  },
  {
    id: '2',
    email: 'newuser2@company.com',
    status: 'PENDING',
    invitedBy: 'admin@company.com',
    createdAt: '2026-03-05',
    expiresAt: '2026-03-07',
  },
  {
    id: '3',
    email: 'olduser@company.com',
    status: 'ACCEPTED',
    invitedBy: 'admin@company.com',
    createdAt: '2026-03-01',
    expiresAt: '2026-03-03',
  },
  {
    id: '4',
    email: 'expired@company.com',
    status: 'EXPIRED',
    invitedBy: 'admin@company.com',
    createdAt: '2026-02-25',
    expiresAt: '2026-02-27',
  },
]

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
  const [inviteOpen, setInviteOpen] = useState(false)

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
            <InviteUserForm onSuccess={() => setInviteOpen(false)} />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
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
                        {user.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead>상태</TableHead>
                    <TableHead>초대자</TableHead>
                    <TableHead>발송일</TableHead>
                    <TableHead>만료일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map(inv => {
                    const status = statusMap[inv.status]
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">
                          {inv.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.invitedBy}
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.createdAt}
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.expiresAt}
                        </TableCell>
                        <TableCell>
                          {inv.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                재발송
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                              >
                                취소
                              </Button>
                            </div>
                          )}
                          {inv.status === 'EXPIRED' && (
                            <Button variant="ghost" size="sm">
                              재발송
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
