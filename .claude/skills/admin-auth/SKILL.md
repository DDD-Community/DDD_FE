---
name: admin-auth
description: |
  apps/admin의 인증/세션/보호 라우트/API 클라이언트 작업 시 자동 호출되는 스킬.
  Google OAuth(Authorization Code) + 자체 JWT + httpOnly 쿠키 기반 백엔드 계약을
  강제하고, `@ddd/api` 의 `createApiClient` 단일 통로(401→refresh 자동 인터셉터 포함)
  를 우회하지 못하게 한다.

  사용 시점:
  - `apps/admin/src/pages/login/**` 또는 로그인 진입점을 추가/수정할 때
  - 로그아웃·회원 탈퇴·세션 만료 처리(`useLogoutFlow`, `/auth/logout`, `/auth/withdrawal`) 작업 시
  - 401 응답 처리, 토큰 갱신(`/auth/refresh`), 자동 재시도 인터셉터를 건드릴 때
  - 보호 라우트(가드, RequireAuth, loader 기반 인증 체크) 도입/수정 시
  - 새 fetch/axios 인스턴스를 만들거나 `credentials`·`withCredentials` 옵션을 변경할 때 → 차단
  - `document.cookie` 로 access_token 을 직접 읽으려 하거나, URL/localStorage 에 토큰을 저장하려 할 때 → 차단
  - `/auth/me` 같은 본인 정보 조회 도입 논의가 발생할 때

  예: "로그인 버튼 동작 추가해줘", "401 떨어졌을 때 자동으로 로그인 페이지로 보내줘",
      "axios 인스턴스 새로 만들어서 토큰 헤더 붙여줄게" (이 경우 본 스킬이 거부 사유와 표준 대안을 안내),
      "로그아웃 시 모달 띄우고 캐시 비워줘"
---

## 단일 출처

상세 규약·계약·플로우 다이어그램은 **[`docs/admin-auth.md`](../../../docs/admin-auth.md)** 를 단일 출처로 한다.
본 스킬은 작업 시 자동 환기시킬 핵심 규약 요약본이다.

## 핵심 규약 (요약)

1. **Google OAuth는 백엔드가 모두 처리한다**
   프론트는 다음 한 줄만 책임진다.

   ```ts
   window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`;
   ```

   - SPA `fetch()` 로 호출하지 않는다(redirect 체인이라 동작 안 함).
   - `?code=` 파라미터 파싱 / Google OAuth client id / popup 창 — **전부 프론트 책임이 아니다.**

2. **토큰은 httpOnly 쿠키. JS는 토큰을 보지도 만지지도 않는다**
   - `document.cookie`, `localStorage`, `sessionStorage`, URL query 어디에도 access_token 을 두지 않는다.
   - `refresh_token` 의 path는 `/api/v1/auth/refresh` 한정이라 다른 경로 호출에는 첨부되지 않는다.
   - 인증 상태는 **API 호출 결과(401 vs 200)로만** 판단한다.

3. **API 호출은 `@ddd/api` 단일 통로로만 한다**
   - `packages/api/src/client.ts` 의 `createApiClient` 가 `credentials: "include"` + 401→`/auth/refresh`→재시도 + 동시성 큐 + `onUnauthorized` 콜백을 책임진다.
   - 새 `fetch(...)` / `axios.create(...)` 인스턴스를 별도로 만들지 않는다. 만들면 401 인터셉터를 우회한다.
   - 페이지/위젯에서는 도메인 훅(`useLogout`, `useApplications` 등)을 통해 호출한다.

4. **세션 만료 처리는 `onUnauthorized` 콜백 한 곳에서**
   `apps/admin/src/main.tsx` 에서 `configureApi` 시 등록한 콜백이 단일 진입점.

   ```ts
   configureApi(apiUrl, {
     onUnauthorized: () => {
       window.location.replace("/");
     },
   });
   ```

   페이지/컴포넌트에서 401을 개별 catch 해서 redirect 하지 않는다.

5. **로그아웃은 `useLogoutFlow` 한 곳에서**
   `apps/admin/src/entities/auth/model/useLogoutFlow.ts` 가 **`useLogout()` mutation + `queryClient.clear()` + `window.location.replace(paths.login)`** 을 묶어둔다.
   직접 `useLogout()` 만 호출하면 캐시 잔존 + 라우팅 누락이다.

   ```tsx
   import { useLogoutFlow } from "@/entities/auth";
   const { logoutAndRedirect, isPending } = useLogoutFlow();
   ```

6. **인증 상태 확인은 옵션 B (보호 API 401 처리) 가 현재 표준**
   - `/auth/me` 엔드포인트는 아직 없다. 부팅 시 별도 인증 체크 호출을 만들지 않는다.
   - 보호 페이지의 데이터 fetch가 401을 받으면 `client.ts` 가 자동 redirect.
   - 사용성 이슈가 누적되면 `docs/admin-auth.md` §6 의 "옵션 A — `/auth/me` 도입" 으로 전환을 백엔드에 요청한다(임의 도입 X).

## 금지 사항 (Anti-pattern)

- ❌ `document.cookie` / `localStorage` 에서 access_token 읽기·쓰기 시도 (httpOnly라 못 읽고, 보안적으로도 잘못된 패턴)
- ❌ 새 axios 인스턴스 / fetch 래퍼를 별도로 만들고 거기에 토큰 헤더를 직접 주입
- ❌ `?code=`, `?token=` 등 OAuth 파라미터를 프론트에서 파싱
- ❌ Google OAuth client id 를 프론트 env 에 넣고 직접 `accounts.google.com` 호출
- ❌ 페이지/컴포넌트마다 401을 catch 해서 `navigate("/login")` 호출 (단일 `onUnauthorized` 콜백 우회)
- ❌ 로그아웃 시 `queryClient.clear()` 누락 (다음 로그인 사용자에게 이전 캐시 노출)
- ❌ refresh 호출을 페이지 코드에서 명시적으로 트리거 (인터셉터 책임)
- ❌ 별도 sessionStorage/Zustand에 "로그인됨" 플래그를 만들어 진실 공급원을 둘로 분리

## 작업 절차

1. 인증·세션·API 클라이언트 관련 작업 요청이 들어오면 본 스킬 → `docs/admin-auth.md` 순으로 표준 확인.
2. 새 인증 흐름이 필요하면 먼저 **기존 `client.ts` / `useLogoutFlow` / `onUnauthorized`** 로 해결 가능한지 검토. 가능하면 새 코드 추가 없이 기존 통로를 사용한다.
3. 보호 라우트 가드를 추가해야 하면 React Router Data Mode 의 loader 또는 `RequireAuth` 컴포넌트 둘 중 하나로만 구현하고, `apps/admin/src/shared/lib/auth.ts` 에 모은다(현재는 stub).
4. 백엔드 계약(쿠키·엔드포인트·flow) 변경이 필요한 요청이면 임의 구현 대신 백엔드 담당에게 요청 후 합의한 계약을 `docs/admin-auth.md` 에 먼저 반영한다.
5. 외부 인증 라이브러리(NextAuth·Auth.js·Clerk·Supabase Auth 등) 도입 요청은 "백엔드 OAuth + 자체 JWT 쿠키 모델로 이미 일관되게 동작 중"임을 안내하고 거절한다.

## 핵심 구현 파일 (빠른 점프)

| 책임                                            | 파일                                                  |
| ----------------------------------------------- | ----------------------------------------------------- |
| API 클라이언트 + 401/refresh 인터셉터           | `packages/api/src/client.ts`                          |
| Auth API (`/refresh`, `/logout`, `/withdrawal`) | `packages/api/src/auth/api.ts`                        |
| Auth 훅                                         | `packages/api/src/auth/hooks.ts`                      |
| API 초기화 + `onUnauthorized`                   | `apps/admin/src/main.tsx`                             |
| 로그인 진입점                                   | `apps/admin/src/pages/login/LoginPage.tsx`            |
| 로그아웃 흐름 훅                                | `apps/admin/src/entities/auth/model/useLogoutFlow.ts` |
| 인증 가드 유틸 (TODO)                           | `apps/admin/src/shared/lib/auth.ts`                   |

---

**마지막 수정**: 2026-05-03
