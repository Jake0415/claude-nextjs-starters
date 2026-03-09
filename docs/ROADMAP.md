# MHSSO AI - 개발 로드맵

## Phase 1: 인프라 설정 ✅

- [x] 패키지 설치 (`@prisma/client`, `jose`, `bcryptjs`, `uuid`, `@prisma/adapter-pg`, `dotenv`)
- [x] Prisma 스키마 작성 (`prisma/schema.prisma`)
- [x] Prisma 7 설정 (`prisma.config.ts`)
- [x] Prisma 클라이언트 생성 (`npx prisma generate`)
- [x] 환경변수 파일 (`.env`)
- [x] 환경변수 검증 확장 (`src/lib/env.ts`)
- [x] Prisma 클라이언트 싱글턴 (`src/lib/db/prisma.ts`)

## Phase 2: 인증 핵심 라이브러리 ✅

- [x] 비밀번호 해싱 (`src/lib/auth/password.ts`)
- [x] JWT 발급/검증 (`src/lib/auth/jwt.ts`)
- [x] Refresh Token 관리 (`src/lib/auth/tokens.ts`)
- [x] SSO 세션 관리 (`src/lib/auth/session.ts`)
- [x] 인가 코드 관리 (`src/lib/auth/authorization-code.ts`)
- [x] 로그인 로그 (`src/lib/auth/login-log.ts`)
- [x] 인증 가드 (`src/lib/auth/guard.ts`)
- [x] Zod 스키마 (`src/lib/schemas/auth.ts`)
- [x] 타입 정의 (`src/lib/types/auth.ts`)

## Phase 3: API 라우트 ✅ (초대/SMTP 제외)

### SSO 인증 API

- [x] `GET /api/auth/authorize` - 외부 앱 인증 요청 진입점
- [x] `POST /api/auth/login` - 로그인 처리
- [x] `POST /api/auth/token` - 인가 코드 → JWT 교환
- [x] `POST /api/auth/refresh` - Access Token 갱신
- [x] `POST /api/auth/logout` - Single Logout
- [x] `GET /api/auth/me` - 사용자 정보 조회
- [x] `GET /api/auth/session` - SSO 세션 기반 사용자 정보

### 관리 API

- [x] `GET/POST /api/admin/users` - 사용자 목록/등록
- [x] `PATCH/DELETE /api/admin/users/[id]` - 사용자 수정/비활성화
- [x] `GET/POST /api/admin/admins` - Admin 목록/등록
- [x] `DELETE /api/admin/admins/[id]` - Admin 비활성화
- [x] `GET/POST /api/admin/redirects` - 허용 URL 관리
- [x] `DELETE /api/admin/redirects/[id]` - 허용 URL 삭제
- [x] `GET /api/admin/stats` - 대시보드 통계
- [x] `GET /api/admin/login-logs` - 전체 로그인 로그

### 사용자/설정 API

- [x] `PATCH /api/user/password` - 비밀번호 변경
- [x] `GET /api/user/login-logs` - 내 로그인 기록
- [x] `GET/POST /api/setup` - 초기 설정

## Phase 4: 미들웨어 ✅

- [x] 미들웨어 기본 구현 (`src/middleware.ts`)
  - [x] 로그인 페이지 세션 체크
  - [x] 보호된 경로 세션 체크
  - [x] /setup 페이지 접근 제어

---

## Phase 5: 퍼블리싱 (UI 마크업) ✅

> API 연동 없이 UI만 먼저 구현. 더미 데이터/목업으로 화면 완성.

### 5-A. 기존 파일 정리

- [x] `src/components/login-form.tsx` 삭제
- [x] `src/components/signup-form.tsx` 삭제
- [x] `src/app/login/` 삭제 (Route Group으로 이동됨)
- [x] `src/app/signup/` 삭제

### 5-B. 레이아웃

- [x] `(auth)/layout.tsx` - 인증 페이지 레이아웃 (센터 정렬)
- [x] `(protected)/layout.tsx` - 보호된 페이지 레이아웃 (사이드바 + 모바일 대응)

### 5-C. 폼 컴포넌트 (RHF + Zod, API 호출은 console.log 대체)

- [x] `components/auth/login-form.tsx` - 로그인 폼
- [x] `components/auth/setup-form.tsx` - Super Admin 생성 폼
- [x] `components/auth/invite-form.tsx` - 초대 수락 폼 (이름 + 비밀번호)
- [x] `components/admin/invite-user-form.tsx` - 사용자 초대 폼 (이메일 입력)
- [x] `components/admin/redirect-form.tsx` - 허용 URL 등록 폼
- [x] `components/admin/smtp-form.tsx` - SMTP 설정 폼 + 테스트 발송
- [x] `components/profile/password-form.tsx` - 비밀번호 변경 폼

### 5-D. 페이지 (더미 데이터로 UI 완성)

- [x] `(auth)/login/page.tsx` - 로그인 페이지
- [x] `(auth)/setup/page.tsx` - 초기 설정 페이지
- [x] `(auth)/invite/[token]/page.tsx` - 초대 수락 페이지
- [x] `(protected)/dashboard/page.tsx` - 대시보드 (Admin: 통계+로그)
- [x] `(protected)/profile/page.tsx` - 내 정보 + 비밀번호 변경
- [x] `(protected)/admin/users/page.tsx` - 사용자 목록 + 초대 발송 + 초대 현황
- [x] `(protected)/admin/admins/page.tsx` - Admin 관리 (테이블 + 등록 다이얼로그)
- [x] `(protected)/admin/redirects/page.tsx` - 허용 URL 관리 (테이블 + 등록 다이얼로그)
- [x] `(protected)/admin/smtp/page.tsx` - SMTP 설정 (Super Admin)
- [x] `docs/page.tsx` - SSO 연동 가이드 (공개 페이지)

### 5-E. 홈페이지 리다이렉트

- [x] `src/app/page.tsx` → `/login`으로 리다이렉트 처리

### 5-F. 빌드 검증

- [x] `npm run check-all` 통과
- [x] `npm run build` 통과

---

## Phase 6: 백엔드 API 연동 🔲

> 퍼블리싱 완료 후, 실제 API와 DB를 연결.

### 6-A. DB 모델 추가

- [ ] `Invitation` 모델 (prisma/schema.prisma)
- [ ] `SmtpConfig` 모델 (prisma/schema.prisma)
- [ ] `npx prisma generate` + `npx prisma db push`

### 6-B. 메일 라이브러리

- [ ] nodemailer 설치
- [ ] `src/lib/mail/smtp.ts` - SMTP 클라이언트 (DB 설정 로드)
- [ ] `src/lib/mail/templates.ts` - 초대 메일 HTML 템플릿

### 6-C. 신규 API 라우트

- [ ] `GET/POST /api/admin/invitations` - 초대 목록/발송
- [ ] `POST /api/admin/invitations/[id]/resend` - 초대 재발송
- [ ] `POST /api/admin/invitations/[id]/cancel` - 초대 취소
- [ ] `GET/POST /api/invite/[token]` - 초대 확인/수락
- [ ] `GET/PUT /api/admin/smtp` - SMTP 설정 조회/저장
- [ ] `POST /api/admin/smtp/test` - 테스트 발송

### 6-D. 기존 API 수정

- [ ] `POST /api/admin/users` → 초대 방식으로 변경 (직접 등록 제거)
- [ ] `GET /api/admin/stats` → 대기 중 초대 수 추가

### 6-E. 인증 연동

- [ ] 로그인 폼 → `POST /api/auth/login`
- [ ] 셋업 폼 → `POST /api/setup`
- [ ] 초대 수락 폼 → `POST /api/invite/[token]`
- [ ] 보호된 레이아웃 → `GET /api/auth/session`
- [ ] 로그아웃 → `POST /api/auth/logout`

### 6-F. 관리 페이지 연동

- [ ] 대시보드 → `GET /api/admin/stats`, `/api/admin/login-logs`
- [ ] User 대시보드 → `GET /api/user/login-logs`
- [ ] 사용자 관리 → 사용자 목록 + 초대 API
- [ ] Admin 관리 → `GET/POST/DELETE /api/admin/admins`
- [ ] 허용 URL → `GET/POST/DELETE /api/admin/redirects`
- [ ] SMTP 설정 → `GET/PUT /api/admin/smtp`, `POST /api/admin/smtp/test`
- [ ] 프로필 → `PATCH /api/user/password`

### 6-G. 미들웨어 강화

- [ ] `/invite/[token]` 경로 허용 (공개 페이지)
- [ ] 초기 설정 여부 체크
- [ ] 홈 리다이렉트 완성

### 6-H. 최종 검증

- [ ] `npm run check-all` 통과
- [ ] `npm run build` 통과
- [ ] E2E: setup → SMTP → 초대 → 수락 → 로그인 → 대시보드 → 관리 → 로그아웃
