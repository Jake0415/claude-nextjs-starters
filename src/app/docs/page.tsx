import { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SSO 연동 가이드 - MHSSO',
  description: '외부 앱에서 MHSSO SSO를 연동하기 위한 개발자 가이드',
}

export default function DocsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            로그인 페이지로
          </Link>
          <h1 className="text-3xl font-bold">SSO 연동 가이드</h1>
          <p className="text-muted-foreground mt-2">
            외부 애플리케이션에서 MHSSO AI를 연동하여 통합 인증(SSO)을 구현하는
            방법을 안내합니다.
          </p>
        </div>

        <div className="space-y-8">
          {/* 빠른 시작 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 시작 (Quick Start)</CardTitle>
              <CardDescription>
                SSO 연동에 필요한 전체 흐름을 3단계로 안내합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <pre>{`[외부 앱] → GET /api/auth/authorize?redirect_url=...
    ↓ (세션 없음)
[MHSSO 로그인 페이지] → 사용자 로그인
    ↓ (로그인 성공)
[외부 앱 콜백] ← redirect_url?code=abc123
    ↓
[외부 앱 서버] → POST /api/auth/token { code }
    ↓
[JWT 발급] ← { access_token, refresh_token }`}</pre>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <Badge className="mb-2">1단계</Badge>
                  <h3 className="font-semibold">허용 URL 등록</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    관리자에게 요청하여 콜백 URL을 허용 목록에 등록합니다.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <Badge className="mb-2">2단계</Badge>
                  <h3 className="font-semibold">인증 요청 구현</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    미인증 사용자를 SSO authorize 엔드포인트로 리다이렉트합니다.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <Badge className="mb-2">3단계</Badge>
                  <h3 className="font-semibold">토큰 교환 구현</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    콜백으로 받은 인가 코드를 JWT로 교환합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API 레퍼런스 */}
          <Card>
            <CardHeader>
              <CardTitle>API 레퍼런스</CardTitle>
              <CardDescription>
                SSO 연동에 사용하는 엔드포인트 목록
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* authorize */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm font-semibold">
                    /api/auth/authorize
                  </code>
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  인증 요청 진입점. 사용자를 SSO 로그인 페이지로 안내합니다.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre>{`GET /api/auth/authorize?redirect_url=https://hr.company.com/callback

# 세션 있음 → 302 → https://hr.company.com/callback?code=abc123
# 세션 없음 → 302 → /login?redirect_url=https://hr.company.com/callback`}</pre>
                </div>
              </div>

              <Separator />

              {/* token */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm font-semibold">/api/auth/token</code>
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  인가 코드를 JWT (Access + Refresh Token)로 교환합니다.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre>{`POST /api/auth/token
Content-Type: application/json

{ "code": "abc123" }

# 응답
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 900
  }
}`}</pre>
                </div>
              </div>

              <Separator />

              {/* refresh */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm font-semibold">
                    /api/auth/refresh
                  </code>
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  Access Token이 만료되면 Refresh Token으로 갱신합니다.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre>{`POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGciOi..." }

# 응답 (새 토큰 쌍 - Rotation 적용)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...(new)",
    "refreshToken": "eyJhbGciOi...(new)",
    "expiresIn": 900
  }
}`}</pre>
                </div>
              </div>

              <Separator />

              {/* logout */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm font-semibold">
                    /api/auth/logout
                  </code>
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  SSO 세션 종료 및 모든 Refresh Token을 무효화합니다.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre>{`POST /api/auth/logout
Authorization: Bearer <access_token>

# 응답
{ "success": true, "message": "로그아웃되었습니다" }`}</pre>
                </div>
              </div>

              <Separator />

              {/* me */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm font-semibold">/api/auth/me</code>
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  Access Token으로 사용자 정보를 조회합니다.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre>{`GET /api/auth/me
Authorization: Bearer <access_token>

# 응답
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "사용자명",
    "role": "USER"
  }
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 언어별 연동 예제 */}
          <Card>
            <CardHeader>
              <CardTitle>언어별 연동 예제</CardTitle>
              <CardDescription>
                주요 프레임워크별 SSO 연동 코드 예제
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="python">
                <TabsList>
                  <TabsTrigger value="python">Python (FastAPI)</TabsTrigger>
                  <TabsTrigger value="javascript">
                    JavaScript (Express)
                  </TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="python">
                  <div className="bg-muted rounded-md p-4 font-mono text-xs">
                    <pre>{`from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import httpx

app = FastAPI()
SSO_BASE = "https://sso.company.com"

@app.get("/login")
def login():
    """미인증 사용자를 SSO로 리다이렉트"""
    return RedirectResponse(
        f"{SSO_BASE}/api/auth/authorize?redirect_url=https://myapp.com/callback"
    )

@app.get("/callback")
async def callback(code: str):
    """SSO에서 인가 코드를 받아 토큰 교환"""
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{SSO_BASE}/api/auth/token", json={"code": code})
        tokens = res.json()["data"]

    # tokens["accessToken"], tokens["refreshToken"] 저장
    return {"message": "로그인 성공", "tokens": tokens}

@app.get("/protected")
async def protected_route(request: Request):
    """Access Token으로 사용자 정보 조회"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SSO_BASE}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    return res.json()`}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="javascript">
                  <div className="bg-muted rounded-md p-4 font-mono text-xs">
                    <pre>{`const express = require("express");
const app = express();
const SSO_BASE = "https://sso.company.com";

// 미인증 사용자를 SSO로 리다이렉트
app.get("/login", (req, res) => {
  res.redirect(
    \`\${SSO_BASE}/api/auth/authorize?redirect_url=https://myapp.com/callback\`
  );
});

// SSO에서 인가 코드를 받아 토큰 교환
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  const tokenRes = await fetch(\`\${SSO_BASE}/api/auth/token\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const { data: tokens } = await tokenRes.json();

  // tokens.accessToken, tokens.refreshToken 저장
  res.json({ message: "로그인 성공", tokens });
});

// Access Token으로 사용자 정보 조회
app.get("/protected", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const meRes = await fetch(\`\${SSO_BASE}/api/auth/me\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  const user = await meRes.json();
  res.json(user);
});`}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="curl">
                  <div className="bg-muted rounded-md p-4 font-mono text-xs">
                    <pre>{`# 1. 인가 코드 발급 (브라우저에서 진행)
# 브라우저로 아래 URL에 접속 → 로그인 후 콜백 URL에서 code 확인
curl -v "https://sso.company.com/api/auth/authorize?redirect_url=https://myapp.com/callback"

# 2. 인가 코드를 JWT로 교환
curl -X POST https://sso.company.com/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"code": "여기에_인가코드"}'

# 3. 사용자 정보 조회
curl https://sso.company.com/api/auth/me \\
  -H "Authorization: Bearer 여기에_액세스토큰"

# 4. Access Token 갱신
curl -X POST https://sso.company.com/api/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken": "여기에_리프레시토큰"}'

# 5. 로그아웃
curl -X POST https://sso.company.com/api/auth/logout \\
  -H "Authorization: Bearer 여기에_액세스토큰"`}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* JWT 구조 */}
          <Card>
            <CardHeader>
              <CardTitle>JWT 구조</CardTitle>
              <CardDescription>
                Access Token 페이로드 필드 및 토큰 검증 방법
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-md p-4 font-mono text-xs">
                <pre>{`// Access Token Payload
{
  "sub": "user-uuid",       // 사용자 고유 ID
  "email": "user@co.com",   // 이메일
  "name": "사용자명",         // 이름
  "role": "USER",            // 역할 (SUPER_ADMIN | ADMIN | USER)
  "type": "access",         // 토큰 타입
  "exp": 1741234567          // 만료 시간 (15분)
}

// Refresh Token Payload
{
  "sub": "user-uuid",
  "tokenId": "refresh-token-uuid",
  "type": "refresh",
  "exp": 1741839367          // 만료 시간 (7일)
}`}</pre>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">토큰 정책</h4>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  <li>
                    <strong>Access Token</strong>: 15분 만료, 요청마다
                    Authorization 헤더에 포함
                  </li>
                  <li>
                    <strong>Refresh Token</strong>: 7일 만료, Rotation 적용
                    (사용 시 새 토큰 쌍 발급)
                  </li>
                  <li>
                    <strong>탈취 감지</strong>: 이미 사용된 Refresh Token이
                    재사용되면 해당 사용자의 모든 토큰 무효화
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 에러 코드 표 */}
          <Card>
            <CardHeader>
              <CardTitle>에러 코드</CardTitle>
              <CardDescription>
                주요 에러 응답 코드 및 대처 방법
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-semibold">코드</th>
                      <th className="py-2 text-left font-semibold">상황</th>
                      <th className="py-2 text-left font-semibold">대처</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">
                        <Badge variant="outline">400</Badge>
                      </td>
                      <td className="py-2">잘못된 요청 (파라미터 누락 등)</td>
                      <td className="py-2">요청 파라미터 확인</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <Badge variant="outline">401</Badge>
                      </td>
                      <td className="py-2">
                        Access Token 만료 또는 유효하지 않음
                      </td>
                      <td className="py-2">
                        Refresh Token으로 갱신, 실패 시 재로그인
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <Badge variant="outline">403</Badge>
                      </td>
                      <td className="py-2">
                        redirect_url 미등록 또는 권한 부족
                      </td>
                      <td className="py-2">관리자에게 URL 등록 요청</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <Badge variant="outline">409</Badge>
                      </td>
                      <td className="py-2">인가 코드 재사용 또는 만료</td>
                      <td className="py-2">
                        인가 코드는 30초 1회용, 새 코드 요청 필요
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <Badge variant="outline">500</Badge>
                      </td>
                      <td className="py-2">서버 내부 에러</td>
                      <td className="py-2">관리자에게 문의</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 연동 체크리스트 */}
          <Card>
            <CardHeader>
              <CardTitle>연동 체크리스트</CardTitle>
              <CardDescription>SSO 연동 시 확인해야 할 항목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  '허용 URL이 관리자에 의해 등록되어 있는가?',
                  '콜백 URL에서 code 쿼리 파라미터를 수신하는가?',
                  '서버에서 /api/auth/token을 호출하는가? (클라이언트에서 직접 호출 금지)',
                  'Access Token 만료 시 /api/auth/refresh로 갱신 처리가 되어 있는가?',
                  'Refresh Token Rotation으로 인해 새 토큰 쌍을 저장하고 있는가?',
                  '로그아웃 시 SSO /api/auth/logout도 호출하는가?',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Checkbox id={`check-${i}`} />
                    <label
                      htmlFor={`check-${i}`}
                      className="text-sm leading-relaxed"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SSO 서버 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>SSO 서버 정보</CardTitle>
              <CardDescription>현재 SSO 서버 연결 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">SSO Base URL</p>
                <code className="bg-muted rounded px-2 py-1 text-sm">
                  https://sso.company.com
                </code>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  등록된 허용 URL
                </p>
                <div className="space-y-1">
                  {[
                    'https://hr.company.com/callback',
                    'https://pm.company.com/auth/callback',
                    'https://crm.company.com/sso/callback',
                    'http://localhost:3001/callback',
                    'https://wiki.company.com/auth',
                  ].map(url => (
                    <div key={url}>
                      <code className="bg-muted rounded px-2 py-0.5 text-xs">
                        {url}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
