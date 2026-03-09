# MHSSO AI - 프로젝트 요구사항 정의서 (PRD)

## 1. 프로젝트 개요

**MHSSO AI**는 다양한 웹 애플리케이션들이 중앙에서 인증을 처리하는 **SSO(Single Sign-On) 서버**이다.

### 핵심 목표

- 자체 인증 제공자(IdP) 구축
- Authorization Code Flow 기반 SSO 인증
- 역할 기반 접근 제어 (RBAC)
- 중앙 집중식 사용자 관리
- 이메일 초대 기반 사용자 등록

### 기술 스택

| 영역           | 기술                                    |
| -------------- | --------------------------------------- |
| Framework      | Next.js 15.5.3 (App Router + Turbopack) |
| Runtime        | React 19.1.0 + TypeScript 5             |
| Database       | PostgreSQL + Prisma 7                   |
| Authentication | JWT (jose) + bcryptjs                   |
| Email          | nodemailer (외부 SMTP 서버 연동)        |
| Styling        | TailwindCSS v4 + shadcn/ui (new-york)   |
| Forms          | React Hook Form + Zod                   |

### 배포 아키텍처

```
[Client] → [Nginx (리버스 프록시)]
               ├── /sso/*     → Next.js (MHSSO - 인증 서버)
               ├── /api/*     → FastAPI (비즈니스 API 서버)
               └── /static/*  → Nginx (정적 파일)
```

---

## 2. 사용자 역할

| 역할            | 설명                                | 권한                               |
| --------------- | ----------------------------------- | ---------------------------------- |
| **Super Admin** | 최초 설정 시 생성되는 최고 관리자   | 모든 권한 + Admin 관리 + SMTP 설정 |
| **Admin**       | Super Admin이 등록한 관리자         | 사용자 초대 + 허용 URL 관리        |
| **User**        | 초대 메일을 통해 가입한 일반 사용자 | SSO 로그인, 비밀번호 변경          |

### 핵심 규칙

- **자가 회원가입 없음** - Admin이 이메일로 초대 → 사용자가 초대 링크에서 계정 생성
- **Admin 생성은 Super Admin만** 가능
- **비밀번호 변경은 본인만** 지원
- **사용자는 모든 앱 접근 가능** (앱별 권한 구분 없음)
- **SMTP 설정은 Super Admin만** 관리

---

## 3. 사용자 초대 흐름

```
1. Admin이 사용자 이메일 입력 → "초대 발송" 클릭
2. MHSSO가 Invitation 레코드 생성 (토큰, 48시간 만료)
3. SMTP를 통해 초대 메일 발송 (초대 링크 포함)
4. 사용자가 메일의 초대 링크 클릭 → /invite/[token] 페이지
5. 사용자가 이름 + 비밀번호 설정 → 계정 생성 완료
6. 로그인 페이지로 리다이렉트
```

### 초대 정책

- **초대 토큰 만료**: 48시간
- **1회용**: 수락 후 재사용 불가
- **재발송 가능**: Admin이 만료된 초대를 재발송 가능
- **취소 가능**: Admin이 미수락 초대를 취소 가능

---

## 4. SMTP 설정 관리

- SMTP 설정은 DB에 저장 (환경변수가 아닌 관리 화면에서 설정)
- Super Admin만 SMTP 설정 변경 가능
- 설정 항목: 호스트, 포트, 사용자명, 비밀번호, 보안(TLS/SSL), 발신자 이름/이메일
- **테스트 발송** 기능: 설정 저장 전 테스트 메일 발송으로 연결 확인
- SMTP 미설정 시 초대 기능 비활성화 (UI에서 안내)

---

## 5. SSO 인증 흐름 (Authorization Code Flow)

```
[외부 앱] → [MHSSO /api/auth/authorize] → [로그인 페이지] → [인가 코드 발급]
    ↓
[외부 앱 서버] → [POST /api/auth/token] → [JWT 발급 (Access + Refresh)]
```

### 상세 흐름

1. 사용자가 외부 앱(hr.company.com) 접속 → 미인증
2. 외부 앱이 리다이렉트: `GET /api/auth/authorize?redirect_url=https://hr.company.com/callback`
3. MHSSO가 redirect_url을 AllowedRedirect DB에서 확인
   - 미등록 URL → 에러
   - SSO 세션 있음 → 인가 코드 생성 → callback?code=abc123
   - SSO 세션 없음 → /login?redirect_url=...
4. 로그인 성공 → SSO 세션 쿠키 설정 + 인가 코드 발급
5. 외부 앱 서버가 `POST /api/auth/token { code }` → JWT 발급
6. Access Token 만료 시 `POST /api/auth/refresh` → 갱신

### 세션 정책

- **SSO 세션**: 8시간, httpOnly 쿠키
- **Access Token**: 15분
- **Refresh Token**: 7일, Rotation 적용, 탈취 감지
- **인가 코드**: 30초, 1회용

### Single Logout

- 로그아웃 시 SSO 세션 종료 + 모든 Refresh Token 무효화
- 다른 앱들은 Access Token 만료 후 재로그인 필요

---

## 6. API 명세

### SSO 인증 API

| 엔드포인트            | 메서드 | 설명                                 |
| --------------------- | ------ | ------------------------------------ |
| `/api/auth/authorize` | GET    | redirect_url 검증 → 세션/로그인 분기 |
| `/api/auth/login`     | POST   | 로그인 → SSO 세션 + 인가 코드        |
| `/api/auth/token`     | POST   | 인가 코드 → JWT 교환                 |
| `/api/auth/refresh`   | POST   | Refresh Token → 새 Access Token      |
| `/api/auth/logout`    | POST   | Single Logout                        |
| `/api/auth/me`        | GET    | 사용자 정보 조회                     |
| `/api/auth/session`   | GET    | SSO 세션 쿠키 기반 사용자 정보       |

### 관리 API

| 엔드포인트                  | 메서드       | 권한        | 설명                 |
| --------------------------- | ------------ | ----------- | -------------------- |
| `/api/admin/users`          | GET          | Admin+      | 사용자 목록          |
| `/api/admin/users/[id]`     | PATCH/DELETE | Admin+      | 사용자 수정/비활성화 |
| `/api/admin/admins`         | GET/POST     | Super Admin | Admin 목록/등록      |
| `/api/admin/admins/[id]`    | DELETE       | Super Admin | Admin 비활성화       |
| `/api/admin/redirects`      | GET/POST     | Admin+      | 허용 URL 목록/추가   |
| `/api/admin/redirects/[id]` | DELETE       | Admin+      | 허용 URL 삭제        |
| `/api/admin/stats`          | GET          | Admin+      | 대시보드 통계        |
| `/api/admin/login-logs`     | GET          | Admin+      | 전체 로그인 로그     |

### 초대 API

| 엔드포인트                           | 메서드 | 권한   | 설명                  |
| ------------------------------------ | ------ | ------ | --------------------- |
| `/api/admin/invitations`             | GET    | Admin+ | 초대 목록 (상태별)    |
| `/api/admin/invitations`             | POST   | Admin+ | 초대 발송 (이메일)    |
| `/api/admin/invitations/[id]/resend` | POST   | Admin+ | 초대 재발송           |
| `/api/admin/invitations/[id]/cancel` | POST   | Admin+ | 초대 취소             |
| `/api/invite/[token]`                | GET    | 공개   | 초대 유효성 확인      |
| `/api/invite/[token]`                | POST   | 공개   | 초대 수락 (계정 생성) |

### SMTP 설정 API

| 엔드포인트             | 메서드 | 권한        | 설명             |
| ---------------------- | ------ | ----------- | ---------------- |
| `/api/admin/smtp`      | GET    | Super Admin | SMTP 설정 조회   |
| `/api/admin/smtp`      | PUT    | Super Admin | SMTP 설정 저장   |
| `/api/admin/smtp/test` | POST   | Super Admin | 테스트 메일 발송 |

### 사용자/설정 API

| 엔드포인트             | 메서드   | 설명                            |
| ---------------------- | -------- | ------------------------------- |
| `/api/user/password`   | PATCH    | 본인 비밀번호 변경              |
| `/api/user/login-logs` | GET      | 내 로그인 기록                  |
| `/api/setup`           | GET/POST | 초기 설정 확인/Super Admin 생성 |

---

## 7. 페이지 구조

```
src/app/
├── (auth)/
│   ├── login/page.tsx          # 로그인 (redirect_url 지원)
│   ├── setup/page.tsx          # 초기 Super Admin 생성
│   └── invite/[token]/page.tsx # 초대 수락 (이름 + 비밀번호 설정)
├── (protected)/
│   ├── dashboard/page.tsx      # 역할별 대시보드
│   ├── profile/page.tsx        # 내 정보 + 비밀번호 변경
│   └── admin/
│       ├── users/page.tsx      # 사용자 관리 + 초대 (Admin+)
│       ├── admins/page.tsx     # Admin 관리 (Super Admin)
│       ├── redirects/page.tsx  # 허용 URL 관리 (Admin+)
│       └── smtp/page.tsx       # SMTP 설정 (Super Admin)
├── docs/
│   └── page.tsx               # SSO 연동 가이드 (공개)
```

---

## 8. 대시보드 요구사항

### Admin/Super Admin 대시보드

- 통계 카드: 전체/활성 사용자, Admin 수, 등록 앱, 활성 세션, 대기 중 초대
- 최근 생성 계정 목록
- 로그인 로그 (성공/실패, IP, 접속 앱)
- 로그인 실패 모니터링

### 일반 사용자 대시보드

- 내 정보 요약
- 최근 로그인 기록
- 현재 활성 세션

---

## 9. SSO 연동 가이드 (헬프 페이지)

공개 페이지 `/docs`로, 외부 앱에서 MHSSO를 연동하기 위한 개발자 가이드를 제공한다. 운영자가 외부 개발자에게 URL을 공유하여 SSO 연동 방법을 안내하는 용도이므로 로그인 없이 접근 가능하다.

### 9-1. 페이지 구성

#### 빠른 시작 (Quick Start)

- SSO 연동에 필요한 전체 흐름 요약 다이어그램
- 3단계 안내: ① 허용 URL 등록 → ② 인증 요청 구현 → ③ 토큰 교환 구현

#### API 레퍼런스

각 엔드포인트별 요청/응답 예제 (코드 블록으로 표시):

- `GET /api/auth/authorize` - 인증 요청 (redirect_url 파라미터)
- `POST /api/auth/token` - 인가 코드 → JWT 교환
- `POST /api/auth/refresh` - Access Token 갱신
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 사용자 정보 조회

#### 언어별 연동 예제

- **Python (FastAPI)** - 미들웨어 + 콜백 라우트 예제
- **JavaScript (Node.js / Express)** - 미들웨어 + 콜백 라우트 예제
- **cURL** - 수동 테스트용 명령어

#### JWT 구조 설명

- Access Token 페이로드 필드 설명 (sub, email, name, role, type, exp)
- Refresh Token 사용법
- 토큰 검증 방법 (공개 키 또는 /api/auth/me 호출)

#### 에러 코드 표

- 401, 403, 409 등 주요 에러 응답과 대처법

#### 연동 체크리스트

- [ ] 허용 URL이 등록되어 있는가?
- [ ] 콜백 URL에서 code 파라미터를 수신하는가?
- [ ] 서버에서 /api/auth/token을 호출하는가? (클라이언트 X)
- [ ] Access Token 만료 시 refresh 처리가 되어 있는가?
- [ ] 로그아웃 시 SSO 로그아웃도 호출하는가?

### 9-2. 현재 SSO 서버 정보 표시

- SSO 서버 Base URL (환경변수에서)
- 등록된 허용 URL 목록 (빠른 확인용)

---

## 10. 데이터 모델

- **User** - 사용자 (SUPER_ADMIN / ADMIN / USER)
- **RefreshToken** - Refresh Token 관리 (Rotation, 탈취 감지)
- **SsoSession** - SSO 세션 (8시간)
- **AuthorizationCode** - 인가 코드 (30초, 1회용)
- **AllowedRedirect** - 허용 리다이렉트 URL
- **LoginLog** - 로그인/로그아웃 감사 로그
- **Invitation** - 사용자 초대 (토큰, 이메일, 역할, 만료, 상태)
- **SmtpConfig** - SMTP 서버 설정 (호스트, 포트, 인증, TLS 등)

---

## 11. 검증 기준

1. 초기 접속 → `/setup` → Super Admin 생성
2. Super Admin 로그인 → 대시보드
3. SMTP 설정 → 테스트 메일 발송 확인
4. 사용자 초대 발송 → 초대 메일 수신 → 초대 링크에서 계정 생성
5. Admin 등록 (Super Admin)
6. 허용 URL 등록
7. SSO 흐름: authorize → 로그인 → 인가 코드 → 토큰 교환
8. 세션 유지: 다른 앱 authorize 시 재로그인 없음
9. Single Logout 동작 확인
10. 비밀번호 변경
11. `npm run check-all` && `npm run build` 통과
