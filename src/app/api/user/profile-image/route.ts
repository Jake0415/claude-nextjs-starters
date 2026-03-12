import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest, handleAuthError } from '@/lib/auth/guard'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request)

    // FormData 파싱
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (e) {
      console.error('[profile-image] FormData 파싱 실패:', e)
      return NextResponse.json(
        { success: false, error: '파일 업로드 형식이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // MIME 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'JPEG, PNG, WebP 형식만 지원합니다.',
        },
        { status: 400 }
      )
    }

    // 파일 크기 검증
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 2MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 기존 이미지 삭제
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { profileImage: true },
    })

    if (currentUser?.profileImage) {
      const oldPath = path.join(
        process.cwd(),
        'public',
        currentUser.profileImage
      )
      await unlink(oldPath).catch(() => {
        // 파일이 이미 없으면 무시
      })
    }

    // 파일 저장
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (e) {
      console.error('[profile-image] 디렉토리 생성 실패:', e)
      return NextResponse.json(
        { success: false, error: '파일 저장 경로를 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    const ext =
      file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const filename = `${payload.sub}_${Date.now()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)

    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
    } catch (e) {
      console.error('[profile-image] 파일 쓰기 실패:', e)
      return NextResponse.json(
        { success: false, error: '파일 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // DB 업데이트
    const profileImage = `/uploads/avatars/${filename}`
    try {
      await prisma.user.update({
        where: { id: payload.sub },
        data: { profileImage },
      })
    } catch (e) {
      console.error('[profile-image] DB 업데이트 실패:', e)
      // 파일은 저장됐지만 DB 업데이트 실패 시 파일 정리
      await unlink(filePath).catch(() => {})
      return NextResponse.json(
        { success: false, error: '프로필 이미지 정보 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { profileImage },
    })
  } catch (error) {
    console.error('[profile-image] Upload error:', error)
    return handleAuthError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { profileImage: true },
    })

    if (user?.profileImage) {
      const filePath = path.join(process.cwd(), 'public', user.profileImage)
      await unlink(filePath).catch(() => {
        // 파일이 이미 없으면 무시
      })
    }

    await prisma.user.update({
      where: { id: payload.sub },
      data: { profileImage: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
