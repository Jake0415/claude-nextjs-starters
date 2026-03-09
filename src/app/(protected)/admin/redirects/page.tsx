'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Plus, ExternalLink } from 'lucide-react'
import { RedirectForm } from '@/components/admin/redirect-form'

// 더미 허용 URL 목록
const redirects = [
  {
    id: '1',
    name: 'HR 시스템',
    url: 'https://hr.company.com/callback',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    name: '프로젝트 관리',
    url: 'https://pm.company.com/auth/callback',
    createdAt: '2026-03-02',
  },
  {
    id: '3',
    name: 'CRM',
    url: 'https://crm.company.com/sso/callback',
    createdAt: '2026-03-03',
  },
  {
    id: '4',
    name: '개발 환경',
    url: 'http://localhost:3001/callback',
    createdAt: '2026-03-04',
  },
  {
    id: '5',
    name: '사내 위키',
    url: 'https://wiki.company.com/auth',
    createdAt: '2026-03-05',
  },
]

export default function RedirectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">허용 URL 관리</h1>
          <p className="text-muted-foreground text-sm">
            SSO 인증 후 리다이렉트가 허용되는 URL 목록
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              URL 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>허용 URL 등록</DialogTitle>
              <DialogDescription>
                외부 앱의 콜백 URL을 등록하여 SSO 연동을 허용합니다
              </DialogDescription>
            </DialogHeader>
            <RedirectForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>등록된 URL</CardTitle>
          <CardDescription>
            총 {redirects.length}개의 앱이 SSO에 연동되어 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>앱 이름</TableHead>
                <TableHead>콜백 URL</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map(redirect => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-medium">{redirect.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="bg-muted rounded px-2 py-0.5 text-xs">
                        {redirect.url}
                      </code>
                      <ExternalLink className="text-muted-foreground h-3 w-3" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {redirect.createdAt}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      삭제
                    </Button>
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
