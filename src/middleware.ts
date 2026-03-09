import { NextRequest, NextResponse } from 'next/server'

const SSO_SESSION_COOKIE = 'sso_session'

// 세션 쿠키 존재 여부만으로 간단한 라우팅 처리 (Edge Runtime 호환)
// 실제 권한 검증은 각 API 라우트와 서버 컴포넌트에서 수행
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get(SSO_SESSION_COOKIE)?.value

  // /setup 페이지: 세션이 있으면 대시보드로
  if (pathname === '/setup') {
    if (sessionId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // /login 페이지: 세션이 있으면 대시보드로
  if (pathname === '/login') {
    if (sessionId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 보호된 경로: 세션 없으면 로그인으로
  // TODO: DB 연결 후 세션 검증 활성화
  // if (
  //   pathname.startsWith('/dashboard') ||
  //   pathname.startsWith('/profile') ||
  //   pathname.startsWith('/admin')
  // ) {
  //   if (!sessionId) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }
  //   return NextResponse.next()
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/setup',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
