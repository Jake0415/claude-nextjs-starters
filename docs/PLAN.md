# MHSSO AI - 구현 계획서

## 작업 전략

**2단계 접근법**으로 구현한다:

1. **Phase 5 (퍼블리싱)**: API 연동 없이 UI만 먼저 완성
   - 더미 데이터로 화면 구조/레이아웃 확인
   - 폼은 RHF + Zod로 구현하되, onSubmit은 `console.log`로 대체
   - 빌드 통과 확인

2. **Phase 6 (백엔드 연동)**: 완성된 UI에 실제 API 호출 연결
   - 신규 DB 모델 추가 (Invitation, SmtpConfig)
   - 신규 API 라우트 추가 (초대, SMTP)
   - 메일 라이브러리 구현
   - 기존 API 수정 (사용자 등록 → 초대 방식)
   - fetch/상태 관리 연결
   - 에러 처리, 로딩 상태
   - 리다이렉트 흐름 완성

## 현재 진행 상황

| Phase                    | 상태             | 설명                                       |
| ------------------------ | ---------------- | ------------------------------------------ |
| Phase 1: 인프라          | ✅ 완료          | Prisma 7, 환경변수, DB 싱글턴              |
| Phase 2: 인증 라이브러리 | ✅ 완료          | JWT, 세션, 토큰, 가드 등                   |
| Phase 3: API 라우트      | ✅ 완료          | 인증/관리/사용자/설정 API (초대/SMTP 제외) |
| Phase 4: 미들웨어        | ✅ 완료          | 세션 기반 라우팅                           |
| Phase 5: 퍼블리싱        | ✅ 완료          | UI 마크업 완성                             |
| **Phase 6: 백엔드 연동** | **🔲 진행 예정** | **← 현재**                                 |

---

## Phase 5 상세 작업 목록

### 1. 기존 파일 정리

기존 스타터 템플릿의 로그인/회원가입 파일 삭제:

- `src/components/login-form.tsx` → 삭제 (새 `components/auth/login-form.tsx`로 대체)
- `src/components/signup-form.tsx` → 삭제 (회원가입 기능 없음)
- `src/app/login/` → 삭제 (`(auth)/login/`으로 이동됨)
- `src/app/signup/` → 삭제

### 2. 보호된 레이아웃 재작성

`(protected)/layout.tsx`를 정적 UI로 재작성:

- 사이드바: 네비게이션 메뉴 (대시보드, 사용자 관리, Admin 관리, 허용 URL, SMTP 설정, 내 정보)
- 사이드바 하단: 테마 토글, 로그아웃 버튼
- 사용자 정보는 하드코딩 더미 (연동 시 교체)
- 역할별 메뉴 필터링은 하드코딩 (연동 시 교체)

### 3. 폼 컴포넌트 (7개)

| 컴포넌트                     | 스키마                  | 설명                                 |
| ---------------------------- | ----------------------- | ------------------------------------ |
| `auth/login-form.tsx`        | `loginSchema`           | 이메일 + 비밀번호, redirect_url 지원 |
| `auth/setup-form.tsx`        | `setupSchema`           | 이름 + 이메일 + 비밀번호 + 확인      |
| `auth/invite-form.tsx`       | `acceptInviteSchema`    | 초대 수락: 이름 + 비밀번호 + 확인    |
| `admin/invite-user-form.tsx` | `inviteUserSchema`      | 사용자 초대: 이메일 입력             |
| `admin/redirect-form.tsx`    | `allowedRedirectSchema` | 이름 + URL                           |
| `admin/smtp-form.tsx`        | `smtpConfigSchema`      | SMTP 설정 폼 + 테스트 발송 버튼      |
| `profile/password-form.tsx`  | `changePasswordSchema`  | 현재 PW + 새 PW + 확인               |

### 4. 페이지 (9개)

| 페이지                                 | 설명                                           |
| -------------------------------------- | ---------------------------------------------- |
| `(auth)/login/page.tsx`                | 로그인 (redirect_url 쿼리 파라미터 표시)       |
| `(auth)/setup/page.tsx`                | 초기 설정                                      |
| `(auth)/invite/[token]/page.tsx`       | 초대 수락 (이름 + 비밀번호 설정)               |
| `(protected)/dashboard/page.tsx`       | Admin: 통계+로그, User: 내 정보+내 로그        |
| `(protected)/profile/page.tsx`         | 내 정보 + 비밀번호 변경                        |
| `(protected)/admin/users/page.tsx`     | 사용자 목록 + 초대 발송 다이얼로그 + 초대 현황 |
| `(protected)/admin/admins/page.tsx`    | Admin 테이블 + 등록 다이얼로그                 |
| `(protected)/admin/redirects/page.tsx` | URL 테이블 + 등록 다이얼로그                   |
| `(protected)/admin/smtp/page.tsx`      | SMTP 설정 폼 + 테스트 발송 (Super Admin)       |
| `docs/page.tsx`                        | SSO 연동 가이드 (공개 페이지)                  |

### 5. 연동 가이드 페이지 상세 구성

`/docs` 페이지는 공개 정적 콘텐츠 페이지 (로그인 불필요, API 연동 불필요):

- **빠른 시작**: 연동 흐름 다이어그램 + 3단계 안내
- **API 레퍼런스**: 엔드포인트별 요청/응답 코드 블록
- **언어별 예제**: Python(FastAPI), JavaScript(Node.js), cURL
- **JWT 구조**: 토큰 페이로드 필드 설명
- **에러 코드 표**: 상태 코드별 대처법
- **연동 체크리스트**: 자가 진단용 체크박스
- **서버 정보**: SSO Base URL, 등록된 허용 URL 목록

### 6. 홈페이지

`page.tsx`를 `/login`으로 리다이렉트하도록 변경.

---

## Phase 6 상세 작업 목록

### 6-A. DB 모델 추가

- `Invitation` 모델: token, email, role, invitedById, status(PENDING/ACCEPTED/CANCELLED/EXPIRED), expiresAt
- `SmtpConfig` 모델: host, port, username, password(암호화), secure, fromName, fromEmail (싱글턴 - 1행만)

### 6-B. 메일 라이브러리

- `src/lib/mail/smtp.ts` - nodemailer SMTP 클라이언트 (DB에서 설정 로드)
- `src/lib/mail/templates.ts` - 초대 메일 HTML 템플릿

### 6-C. 신규 API 라우트

- 초대 API: 목록, 발송, 재발송, 취소
- 초대 수락 API: 토큰 검증, 계정 생성
- SMTP API: 조회, 저장, 테스트 발송

### 6-D. 기존 API 수정

- `POST /api/admin/users` → 삭제 또는 초대 방식으로 변경
- Admin 등록은 기존 방식 유지 (Super Admin이 직접 비밀번호 설정)

### 6-E. 인증 연동

- 로그인 폼 → `POST /api/auth/login`
- 셋업 폼 → `POST /api/setup`
- 보호된 레이아웃 → `GET /api/auth/session` (사용자 정보)
- 로그아웃 → `POST /api/auth/logout`

### 6-F. 페이지별 연동

- 대시보드 → `GET /api/admin/stats`, `/api/admin/login-logs`, `/api/user/login-logs`
- 사용자 관리 → `GET /api/admin/users`, 초대 API
- Admin 관리 → `GET/POST/DELETE /api/admin/admins`
- 허용 URL → `GET/POST/DELETE /api/admin/redirects`
- SMTP 설정 → `GET/PUT /api/admin/smtp`, `POST /api/admin/smtp/test`
- 프로필 → `PATCH /api/user/password`
- 초대 수락 → `GET/POST /api/invite/[token]`

### 6-G. 미들웨어 강화

- `/invite/[token]` 경로 허용 (공개 페이지)
- 초기 설정 여부 체크
- 홈 리다이렉트 완성

### 6-H. 최종 검증

- `npm run check-all` 통과
- `npm run build` 통과
- E2E: setup → SMTP 설정 → 사용자 초대 → 초대 수락 → 로그인 → 대시보드 → 관리 → 로그아웃
