# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**MHSSO AI**는 Authorization Code Flow 기반 SSO(Single Sign-On) 인증 서버다. 자체 IdP로서 역할 기반 접근 제어(RBAC: SUPER_ADMIN / ADMIN / USER)와 이메일 초대 기반 사용자 등록을 제공한다.

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Database**: PostgreSQL + Prisma 7 (client output: `src/generated/prisma`)
- **Auth**: JWT (jose) + bcryptjs, 세션 쿠키(`sso_session`)
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions

## 명령어

```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드 (--turbopack)
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 검사
npm run typecheck    # TypeScript 타입 검사
npm run check-all    # typecheck + lint + format:check 통합 실행

# Prisma
npx prisma generate  # Prisma 클라이언트 생성
npx prisma db push   # 스키마를 DB에 반영

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add <component-name>
```

## 아키텍처

### 라우트 구조

- `src/app/(auth)/` — 인증 페이지 (login, setup, invite/[token]). 좌우 분할 레이아웃 (브랜드 패널 + 폼)
- `src/app/(protected)/` — 로그인 필요 페이지 (dashboard, admin/\*, profile). 사이드바 레이아웃 with RBAC 네비게이션
- `src/app/api/auth/` — 인증 API (login, logout, authorize, token, refresh, session, me)
- `src/app/api/admin/` — 관리자 API (users, admins, redirects, stats, login-logs)
- `src/app/api/user/` — 사용자 API (password, login-logs)
- `src/app/api/setup/` — 초기 Super Admin 계정 생성

### 인증 흐름

1. **middleware.ts**: Edge Runtime에서 쿠키 존재 여부로 라우팅만 처리 (실제 검증은 API에서)
2. **API 인증**: `src/lib/auth/guard.ts`의 `authenticateRequest()` (Bearer 토큰) / `requireRole()` (역할 검증)
3. **JWT**: `src/lib/auth/jwt.ts` — Access/Refresh 토큰 발급·검증
4. **SSO Flow**: `src/lib/auth/authorization-code.ts` — Authorization Code 생성·교환

### 핵심 라이브러리

- `src/lib/env.ts` — Zod로 환경 변수 검증 (DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET 필수)
- `src/lib/db/prisma.ts` — Prisma 클라이언트 싱글턴
- `src/lib/schemas/auth.ts` — Zod 검증 스키마
- `src/lib/types/auth.ts` — 인증 관련 TypeScript 타입

### DB 스키마 (prisma/schema.prisma)

User, RefreshToken, SsoSession, AuthorizationCode, AllowedRedirect, LoginLog 6개 모델. 모든 모델은 `@@map()`으로 snake_case 테이블명 사용, 필드도 `@map()`으로 snake_case 컬럼 매핑.

### 경로 별칭

`@/*` → `./src/*` (tsconfig.json paths)

## 개발 가이드 문서

- `docs/ROADMAP.md` — 개발 로드맵
- `docs/PRD.md` — 프로젝트 요구사항 정의서
- `docs/guides/project-structure.md` — 프로젝트 구조
- `docs/guides/styling-guide.md` — 스타일링 가이드
- `docs/guides/component-patterns.md` — 컴포넌트 패턴
- `docs/guides/nextjs-15.md` — Next.js 15 가이드
- `docs/guides/forms-react-hook-form.md` — 폼 처리 가이드

## 코드 컨벤션

- pre-commit hook (Husky + lint-staged): JS/TS 파일은 ESLint + Prettier, JSON/CSS/MD 파일은 Prettier 자동 실행
- ESLint: next/core-web-vitals + next/typescript + prettier 확장
- Prisma generated client는 `src/generated/prisma`에 출력되며 gitignore 대상이 아님
- API 응답 형식: `{ success: boolean, data?: ..., error?: string }`
- 에러 처리: `AuthError` 클래스 + `handleAuthError()` 유틸리티
