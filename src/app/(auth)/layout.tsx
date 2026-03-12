import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* 왼쪽 브랜드 패널 */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
        {/* 배경 이미지 */}
        <Image
          src="/sso-bg.svg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* 텍스트 오버레이 */}
        <div className="relative z-10 max-w-lg space-y-6 px-12 text-center">
          <div className="flex items-center justify-center gap-4">
            <Image
              src="/logo.svg"
              alt="MHSSO AI"
              width={48}
              height={48}
              className="drop-shadow-lg"
            />
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
              MHSSO AI
            </h1>
          </div>
          <div className="space-y-2">
            <p className="text-xl leading-relaxed font-semibold tracking-wide text-white/90 drop-shadow-md">
              하나의 인증, 모든 서비스 연결
            </p>
            <p className="text-sm leading-relaxed tracking-wider text-white/60">
              Single Sign-On for Seamless Experience
            </p>
          </div>
        </div>
      </div>
      {/* 오른쪽 폼 영역 */}
      <div className="bg-background flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  )
}
