'use client'

import { useCallback, useRef, useState } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { apiUpload, apiDelete } from '@/lib/api/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

interface ProfileImageUploadProps {
  currentImage: string | null
  userName: string
  onUpdate: () => void
}

export function ProfileImageUpload({
  currentImage,
  userName,
  onUpdate,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 이니셜 생성
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleUpload = useCallback(
    async (file: File) => {
      // 클라이언트 측 검증
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('JPEG, PNG, WebP 형식만 지원합니다.')
        return
      }
      if (file.size > MAX_SIZE) {
        toast.error('파일 크기는 2MB 이하여야 합니다.')
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await apiUpload<{ profileImage: string }>(
          '/api/user/profile-image',
          formData
        )

        if (res.success) {
          toast.success('프로필 이미지가 변경되었습니다.')
          onUpdate()
        } else {
          toast.error(res.error || '업로드에 실패했습니다.')
        }
      } catch {
        toast.error('업로드 중 오류가 발생했습니다.')
      } finally {
        setUploading(false)
      }
    },
    [onUpdate]
  )

  const handleDelete = useCallback(async () => {
    setUploading(true)
    try {
      const res = await apiDelete('/api/user/profile-image')
      if (res.success) {
        toast.success('프로필 이미지가 삭제되었습니다.')
        onUpdate()
      } else {
        toast.error(res.error || '삭제에 실패했습니다.')
      }
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }, [onUpdate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const openFilePicker = () => {
    if (!uploading) inputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-6">
      {/* 파일 입력 (숨김) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 아바타 클릭 = 파일 선택 */}
      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') openFilePicker()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-full transition-all ${
          dragging ? 'ring-primary ring-2 ring-offset-2' : ''
        }`}
      >
        <Avatar className="h-20 w-20">
          {currentImage ? (
            <AvatarImage src={currentImage} alt={userName} key={currentImage} />
          ) : null}
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* 오버레이 */}
        {uploading ? (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="bg-background/0 hover:bg-background/60 absolute inset-0 flex items-center justify-center rounded-full transition-colors">
            <Upload className="h-5 w-5 opacity-0 transition-opacity [div:hover>&]:opacity-100" />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">프로필 사진</p>
        <p className="text-muted-foreground text-xs">
          JPEG, PNG, WebP · 최대 2MB
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            disabled={uploading}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            변경
          </Button>
          {currentImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              삭제
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
