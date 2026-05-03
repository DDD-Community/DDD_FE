# DDD 어드민 인증 — 프론트엔드 연동 가이드 (단일 출처)

> 본 문서는 `.claude/skills/admin-auth` 스킬의 **단일 출처(single source of truth)** 다.
> 인증·세션·라우팅·API 클라이언트 관련 작업은 이 문서를 기준으로 한다.

---

## 1. 인증 방식 개요

- **Google OAuth 2.0 (Authorization Code Flow)** + **자체 발급 JWT** + **httpOnly 쿠키** 조합.
- 프론트는 Google 화면을 직접 띄우지 않는다. 백엔드가 Passport(`google` strategy)로 Google과 토큰을 교환하고, 인증 완료 후 자체 access_token / refresh_token을 발급해 쿠키에 박는다.
- 프론트는 access_token을 **JS로 직접 다루지 않는다.** 쿠키는 `httpOnly`라서 `document.cookie`로 읽을 수 없고, API 호출 시 브라우저가 자동으로 쿠키를 첨부한다.

---

## 2. 로그인 시작 — 프론트가 해야 할 단 한 가지

```ts
// "Google로 로그인" 버튼 클릭 시
window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`
```

- SPA fetch가 아니라 **반드시 top-level navigation** (`window.location.href` 또는 `<a href>`).
  OAuth는 브라우저 redirect 체인이라 fetch로 시작하면 작동하지 않는다.
- 운영 환경 베이스: `https://api.dddstudy.kr` (도메인은 환경별 env로 관리).
- 현재 구현: `apps/admin/src/pages/login/LoginPage.tsx`.

---

## 3. 로그인 플로우 (전체)

```
[Frontend] /login 페이지에서 버튼 클릭
   ↓ window.location.href = "{API_BASE}/api/v1/auth/google"
[Backend] GET /api/v1/auth/google
   ↓ 302 → Google authorize URL
[Google] 사용자 동의
   ↓ 302 → "{API_BASE}/api/v1/auth/google/callback?code=..."
[Backend] GET /api/v1/auth/google/callback
   ↓ code → token 교환, 사용자 upsert, 자체 JWT 발급
   ↓ Set-Cookie: access_token, refresh_token (httpOnly)
   ↓ 302 → CLIENT_REDIRECT_URL (= 프론트 URL)
[Frontend] 쿠키 들고 도착. 인증 상태 확인 후 라우팅 결정.
```

- 프론트가 `?code=...` 같은 OAuth 파라미터를 직접 파싱할 일은 **없다**. 그건 전부 백엔드 책임.
- 프론트 도착 URL은 단순 `https://admin.dddstudy.kr/` 같은 루트(또는 env 설정값). 토큰을 URL에 실어 보내지 않는다.

---

## 4. 발급되는 쿠키 — 핵심 스펙

| 쿠키            | httpOnly | secure                | sameSite | path                    | maxAge |
| --------------- | -------- | --------------------- | -------- | ----------------------- | ------ |
| `access_token`  | ✅       | prod=true / dev=false | `lax`    | `/`                     | 24h    |
| `refresh_token` | ✅       | prod=true / dev=false | `lax`    | `/api/v1/auth/refresh`  | 7d     |

- **`refresh_token`의 path는 `/api/v1/auth/refresh` 한정**. 다른 경로 호출에는 첨부되지 않는다(보안 분리).
- **JS에서 쿠키 직접 읽기 불가** (httpOnly). 인증 상태는 API 호출로 판단한다.
- localhost 개발 시 포트가 달라도(3000 ↔ 5173) **도메인이 같으면 쿠키 공유**되므로 그대로 동작한다.

---

## 5. API 호출 시 필수 설정

모든 인증이 필요한 API 호출에 쿠키가 자동 첨부되어야 한다. **공통 클라이언트 한 곳에서 처리**한다.

### 현재 구현 — `packages/api`

`packages/api/src/client.ts` 의 `createApiClient` 가 다음을 책임진다.

- `credentials: "include"` 옵션을 모든 요청에 적용.
- 401 응답 → `POST /api/v1/auth/refresh` 자동 호출 → 성공 시 원래 요청 재시도, 실패 시 `onUnauthorized()` 콜백.
- refresh 동시성 제어(여러 401이 동시에 발생해도 refresh는 한 번만, 나머지는 큐에서 대기 후 재시도).

### 어드민 측 초기화 — `apps/admin/src/main.tsx`

```ts
configureApi(apiUrl, {
  onUnauthorized: () => {
    window.location.replace("/")
  },
})
```

- 새 API fetch 래퍼/axios 인스턴스를 **별도로 만들지 않는다**. 항상 `@ddd/api` 의 `getApiClient()` 또는 도메인별 hook(`useLogout` 등)을 통해 호출한다.
- **금지**: 직접 `fetch(...)` / `axios.create(...)` 를 새로 만들고 `credentials` 누락. 401 인터셉터를 우회하는 결과를 만든다.

---

## 6. 인증 상태 확인 패턴

⚠️ **현재 백엔드에는 `/auth/me` 같은 본인 정보 조회 엔드포인트가 없다.** 둘 중 하나를 택해야 한다.

### 옵션 A — `/auth/me` 추가 후 사용 (권장, 사용성 ↑)

```ts
// 앱 부팅 시
GET /api/v1/auth/me
  → 200 { id, email, roles } : 인증 OK → 보호 라우트 진입
  → 401                       : 로그인 페이지로 리다이렉트
```

- 라우트 가드(loader 또는 RequireAuth 컴포넌트)에서 호출.
- React Router Data Mode를 쓰므로 보호 라우트의 loader에서 `/auth/me` 호출이 자연스럽다.

### 옵션 B — 첫 보호 API 호출 결과로 판단 (현재 상태)

- 페이지 데이터 fetch에서 401 → `client.ts` 의 `onUnauthorized()` 가 자동으로 `/`로 redirect.
- ad-hoc하지만 추가 백엔드 작업 없이 진행 가능.

**현재 어드민은 옵션 B로 동작 중.** 사용성이 떨어진다고 판단되면 백엔드에 `/auth/me` 추가를 요청한다.

---

## 7. 토큰 갱신

```http
POST /api/v1/auth/refresh
```

- body 없음. `refresh_token` 쿠키만으로 동작.
- 응답 body: `{ accessToken: "..." }` (프론트가 안 써도 된다, 새 access_token도 쿠키로 같이 셋팅됨).
- **모든 보호 API의 401 응답을 인터셉트 → `/auth/refresh` 호출 → 성공 시 원래 요청 재시도, 실패 시 로그인 페이지로** 패턴이 표준.
- 현재는 `packages/api/src/client.ts` 의 `handleUnauthorized()` 에서 처리 중. 별도 인터셉터를 추가로 만들지 않는다.

---

## 8. 로그아웃

```http
POST /api/v1/auth/logout
```

- 인증 필요 (access_token 쿠키 자동 첨부).
- 응답 204. 쿠키 모두 삭제됨.
- 프론트는 호출 후 **로컬 인증 상태 / TanStack Query 캐시 초기화 + 로그인 페이지 redirect**.

### 현재 구현 — `apps/admin/src/entities/auth/model/useLogoutFlow.ts`

```tsx
import { useLogoutFlow } from "@/entities/auth"

const { logoutAndRedirect, isPending } = useLogoutFlow()
// 클릭 시 logoutAndRedirect() 호출 → 성공 시 queryClient.clear() + window.location.replace("/")
```

- 로그아웃 UX는 **반드시 이 훅을 통해서** 호출한다. 직접 `useLogout()` 만 호출하면 캐시/리다이렉트가 누락된다.

---

## 9. 회원 탈퇴

```http
DELETE /api/v1/auth/withdrawal
```

- 인증 필요. Google 토큰 revoke + 계정 soft delete + 쿠키 삭제. 응답 204.
- 훅: `useWithdrawal()` (`@ddd/api`). 로그아웃과 동일하게 캐시 정리 + 로그인 redirect 후처리 필요(추후 `useWithdrawalFlow` 흐름 훅 추가 예정).

---

## 10. 보호 라우트 — 어떤 엔드포인트가 인증 필요한가

대략 다음 prefix는 인증 필수:
- `/api/v1/admin/**` (RolesGuard도 함께 — 일반 유저 401/403)
- `/api/v1/auth/logout`, `/api/v1/auth/withdrawal`
- 기타 `@UseGuards(AuthGuard('jwt'))` 가 붙은 엔드포인트

공개 엔드포인트:
- `/api/v1/auth/google`, `/api/v1/auth/google/callback`, `/api/v1/auth/refresh`
- `/api/v1/health`, `/api/v1/blog-posts` (조회), `/api/v1/early-notifications` 등

---

## 11. JWT 페이로드

백엔드가 토큰에 박아주는 정보:

```ts
{
  sub: string;      // user id
  email: string;
  roles: string[];  // 권한 문자열 배열
}
```

- 프론트가 토큰을 직접 디코드할 일은 거의 없다. `/auth/me` 추가 시 같은 정보가 내려온다고 가정하면 된다.

---

## 12. 환경 변수

프론트의 `.env`에 백엔드 베이스 URL만 관리하면 충분하다.

```
# dev
VITE_API_URL=http://localhost:3000

# prod
VITE_API_URL=https://api.dddstudy.kr   # 실제 도메인 확인 필요
```

- OAuth 관련 secret / client id 는 프론트가 가지지 않는다(전부 백엔드 책임).
- `VITE_API_URL`이 없으면 `main.tsx` 에서 즉시 throw 한다.

---

## 13. 로컬 개발 시 주의사항

- 백엔드가 `NODE_ENV=development` 모드일 때, OAuth 콜백 후 **프론트로 redirect 하지 않고 JSON `{ accessToken: ... }`을 화면에 띄우는 디버그 분기**가 있다 (`google-auth.controller.ts:80-83`).
  - 운영처럼 자동 redirect를 보고 싶으면 백엔드 담당에게 해당 분기 비활성화를 요청하거나, JSON 화면이 뜨면 직접 `localhost:5173` 으로 이동.
  - 쿠키는 어쨌든 셋팅되므로 그 후 프론트에서 보호 API 호출은 정상 작동.
- 백엔드 CORS는 `credentials: true` + 화이트리스트 origin (`localhost:3000`, `localhost:5173`) 으로 열려 있다.

---

## 14. 작업 시 확인 항목 (체크리스트)

- [ ] 로그인 진입점이 `window.location.href`로 백엔드 `/api/v1/auth/google`을 호출하는가?
- [ ] 모든 API 호출이 `@ddd/api` 의 `getApiClient()` / 도메인 hook 으로 통일되어 `credentials: "include"` 가 적용되고 있는가? (별도 fetch/axios 인스턴스를 만들지 않았는가?)
- [ ] 401 응답 시 `/auth/refresh` 자동 호출 → 재시도 → 실패 시 로그인 redirect가 동작하는가? (`client.ts` 흐름을 우회하지 않았는가?)
- [ ] 인증 상태 확인 로직이 (`/auth/me` 호출 또는 보호 API 401 처리) 정해져 있는가?
- [ ] 로그아웃 버튼이 `useLogoutFlow()` 를 통해 호출되어 캐시 초기화 + redirect까지 수행하는가?
- [ ] 보호 라우트 진입 시 비로그인 사용자를 로그인 페이지로 redirect하는 가드가 있는가? (현재는 `onUnauthorized` 콜백으로 처리)
- [ ] env 분기 (`VITE_API_URL`) 가 dev/prod 모두 셋팅되어 있는가?

---

## 15. 핵심 구현 파일 매핑

| 책임                              | 파일                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| API 클라이언트 + 401/refresh 인터셉터 | `packages/api/src/client.ts`                                    |
| Auth 도메인 API (`/refresh`, `/logout`, `/withdrawal`) | `packages/api/src/auth/api.ts`                                  |
| Auth 훅(`useLogout`, `useRefreshToken`, `useWithdrawal`) | `packages/api/src/auth/hooks.ts`                                |
| API 초기화(`onUnauthorized`)      | `apps/admin/src/main.tsx`                                       |
| Google 로그인 버튼/진입점         | `apps/admin/src/pages/login/LoginPage.tsx`                      |
| 로그아웃 흐름 훅                  | `apps/admin/src/entities/auth/model/useLogoutFlow.ts`           |
| 라우트 경로 상수                  | `apps/admin/src/shared/lib/paths.ts`                            |
| 인증 가드 유틸 (TODO)             | `apps/admin/src/shared/lib/auth.ts`                             |

---

**마지막 수정**: 2026-05-03
