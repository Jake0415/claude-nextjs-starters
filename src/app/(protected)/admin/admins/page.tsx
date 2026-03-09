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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldPlus } from 'lucide-react'

// 더미 Admin 목록
const admins = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@company.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    name: '박관리',
    email: 'admin2@company.com',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-03-03',
  },
  {
    id: '3',
    name: '최관리',
    email: 'admin3@company.com',
    role: 'ADMIN',
    isActive: false,
    createdAt: '2026-02-15',
  },
]

export default function AdminsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Phase 6에서 API 연동 예정
    console.log('Admin 등록:', Object.fromEntries(formData))
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin 관리</h1>
          <p className="text-muted-foreground text-sm">
            관리자 계정 목록 및 등록 (Super Admin 전용)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ShieldPlus className="mr-2 h-4 w-4" />
              Admin 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin 등록</DialogTitle>
              <DialogDescription>
                새로운 관리자 계정을 직접 생성합니다
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">이름</Label>
                <Input
                  id="admin-name"
                  name="name"
                  placeholder="관리자 이름"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">이메일</Label>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="admin@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="8자 이상"
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full">
                Admin 등록
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin 목록</CardTitle>
          <CardDescription>
            등록된 관리자 계정 ({admins.length}명)
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
                <TableHead>등록일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.role === 'SUPER_ADMIN' ? 'default' : 'secondary'
                      }
                    >
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? 'default' : 'destructive'}>
                      {admin.isActive ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{admin.createdAt}</TableCell>
                  <TableCell>
                    {admin.role !== 'SUPER_ADMIN' && admin.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        비활성화
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
