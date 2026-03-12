'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Plus, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RedirectForm } from '@/components/admin/redirect-form'
import { apiGet, apiDelete } from '@/lib/api/client'

interface RedirectData {
  id: string
  name: string
  url: string
  createdAt: string
}

export default function RedirectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [redirects, setRedirects] = useState<RedirectData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRedirects = useCallback(async () => {
    const res = await apiGet<RedirectData[]>('/api/admin/redirects')
    if (res.success && res.data) setRedirects(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRedirects()
  }, [fetchRedirects])

  const handleDelete = async (id: string) => {
    const res = await apiDelete(`/api/admin/redirects?id=${id}`)
    if (res.success) {
      toast.success('URL이 삭제되었습니다.')
      fetchRedirects()
    } else {
      toast.error(res.error || '삭제에 실패했습니다.')
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
            <RedirectForm
              onSuccess={() => {
                setDialogOpen(false)
                fetchRedirects()
              }}
            />
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
              {redirects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground text-center"
                  >
                    등록된 URL이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                redirects.map(redirect => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-medium">
                      {redirect.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="bg-muted rounded px-2 py-0.5 text-xs">
                          {redirect.url}
                        </code>
                        <ExternalLink className="text-muted-foreground h-3 w-3" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(redirect.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(redirect.id)}
                      >
                        삭제
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
