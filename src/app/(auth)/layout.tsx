export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* 왼쪽 브랜드 패널 */}
      <div className="bg-sidebar hidden w-1/2 items-center justify-center lg:flex">
        <div className="max-w-md space-y-4 px-12 text-center">
          <h1 className="text-4xl font-bold text-white">MHSSO AI</h1>
          <p className="text-sidebar-foreground/70 text-lg">
            통합 인증 서버로 모든 서비스를 하나의 계정으로 관리하세요
          </p>
        </div>
      </div>
      {/* 오른쪽 폼 영역 */}
      <div className="bg-background flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  )
}
