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
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiGet, apiPatch } from '@/lib/api/client'
import { InviteUserForm } from '@/components/admin/invite-user-form'

interface AdminData {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAdmins = useCallback(async () => {
    const res = await apiGet<AdminData[]>('/api/admin/admins')
    if (res.success && res.data) setAdmins(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const res = await apiPatch('/api/admin/admins', { id, isActive: !isActive })
    if (res.success) {
      toast.success(isActive ? '비활성화되었습니다.' : '활성화되었습니다.')
      fetchAdmins()
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
          <h1 className="text-2xl font-bold">계정 관리</h1>
          <p className="text-muted-foreground text-sm">
            계정 초대 및 관리 (Super Admin 전용)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              계정 초대
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>계정 초대</DialogTitle>
              <DialogDescription>
                이메일로 초대장을 발송합니다. 초대받은 사용자가 직접 비밀번호를
                설정합니다.
              </DialogDescription>
            </DialogHeader>
            <InviteUserForm
              showRoleSelect={true}
              availableRoles={['ADMIN', 'USER']}
              defaultRole="ADMIN"
              apiEndpoint="/api/admin/admins"
              onSuccess={() => {
                setDialogOpen(false)
                fetchAdmins()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 목록</CardTitle>
          <CardDescription>등록된 계정 ({admins.length}명)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground text-center"
                  >
                    등록된 계정이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                admins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          admin.role === 'ADMIN' ? 'default' : 'secondary'
                        }
                      >
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={admin.isActive ? 'default' : 'destructive'}
                      >
                        {admin.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={admin.isActive ? 'text-destructive' : ''}
                        onClick={() =>
                          handleToggleActive(admin.id, admin.isActive)
                        }
                      >
                        {admin.isActive ? '비활성화' : '활성화'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
