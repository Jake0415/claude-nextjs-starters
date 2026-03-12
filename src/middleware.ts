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
    // 외부 앱 SSO 요청(redirect_url 포함)이면 로그인 페이지 표시
    const redirectUrl = request.nextUrl.searchParams.get('redirect_url')
    if (redirectUrl) {
      return NextResponse.next()
    }
    if (sessionId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // /invite 페이지: 공개 페이지로 허용
  if (pathname.startsWith('/invite')) {
    return NextResponse.next()
  }

  // 보호된 경로: 세션 없으면 로그인으로
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin')
  ) {
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/setup',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/invite/:path*',
  ],
}
