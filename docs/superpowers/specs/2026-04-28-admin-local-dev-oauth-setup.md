# 어드민 로컬 dev OAuth 검증 환경 셋업 (계획 + 배경)

> 본 문서는 **계획과 그 배경**을 기록한 메모. 코드 변경은 아직 시작하지 않음.
> 후속 라운드에서 이 문서를 기반으로 정식 spec → plan → 구현으로 발전시킨다.

## 배경 — 왜 이 일을 고민하게 됐나

[`2026-04-28-admin-auth-completion-design.md`](./2026-04-28-admin-auth-completion-design.md) 라운드에서 어드민의 Google OAuth 연결 / Minimal 인증 가드 / 회원가입 잔존 코드 정리를 끝냈다. 코드/문서 변경은 모두 정합하게 마쳤고 lint도 그린.

그러나 사용자가 검증 단계(스펙 §검증 항목 4)에서 막혔다:

- 어드민 프론트를 로컬(`http://localhost:5173`)에서 띄우고
- `VITE_API_URL=https://admin.dddstudy.kr` (GCP에 배포된 prod 백엔드)로 OAuth 흐름 시도
- 로그인 → Google 인증 → 콜백까지는 정상 진행
- **마지막 redirect 도착지가 `https://admin.dddstudy.kr/`** 가 되면서 백엔드의 `{"code":"NOT_FOUND","message":"Cannot GET /","data":null}` 응답을 받음

확인 결과 백엔드의 `CLIENT_REDIRECT_URL` 환경변수가 `https://admin.dddstudy.kr` 로 설정되어 있다. 이 도메인은 어드민 프론트와 백엔드가 **같은 도메인에 함께 배포**되는 의도(`/api/*` 백엔드, 그 외 SPA 정적 파일)로 보이지만, 어드민 프론트의 prod 정적 호스팅이 아직 셋업되지 않아 `GET /` 가 백엔드까지 도달해 NOT_FOUND를 받는 구조.

즉 본질은 **두 개의 별개 문제**:
1. (인프라) 어드민 프론트가 `https://admin.dddstudy.kr`에 아직 배포되지 않음 → prod 환경에서의 검증이 막힘
2. (개발 환경) 로컬 dev에서 OAuth를 끝까지 검증하려면 cross-origin 쿠키와 OAuth redirect URI 환경 분기 문제를 풀어야 함

본 문서는 **2번(로컬 dev 검증 환경)** 을 다룬다. 1번(prod 배포)은 별도 라운드.

## 진단 — 로컬 dev OAuth가 그냥 안 되는 이유

prod 백엔드 한 대(`https://admin.dddstudy.kr`)에 로컬 프론트(`http://localhost:5173`)를 붙여 OAuth를 끝까지 흘리는 건 다음 중첩된 제약 때문에 거의 불가능:

### (a) Google OAuth `redirect_uri`는 정적 등록값만 허용
- 백엔드의 OAuth 시작 핸들러는 Google에 `redirect_uri=...` 파라미터를 같이 넘기고, Google은 정확히 그 URI로만 콜백을 보낸다 (Google OAuth 콘솔에 사전 등록된 URI여야 함).
- prod 백엔드 인스턴스 하나만 있다면 그 인스턴스의 `redirect_uri`는 prod 값(예: `https://admin.dddstudy.kr/api/v1/auth/google/callback`)으로 hardcoded. 로컬에서 콜백을 받으려면 별도 dev 콜백 URI 등록이 필요하고 그것을 사용하는 dev 백엔드 인스턴스가 있어야 한다.

### (b) Cross-origin 쿠키 송수신
- OAuth 콜백 응답은 백엔드 도메인 첫방문(first-party context)이라 `Set-Cookie`는 잘 박힌다 (`Domain=admin.dddstudy.kr`).
- 그러나 그 후 SPA가 `http://localhost:5173`에서 `https://admin.dddstudy.kr/api/...` 로 fetch를 보낼 때(cross-site request), 쿠키가 자동 첨부되려면:
  - 쿠키가 `SameSite=None; Secure` 로 set되어 있어야 함 (백엔드 default는 보통 `Lax` — 그러면 cross-site에 안 감)
  - 백엔드가 CORS 헤더로 `Access-Control-Allow-Origin: http://localhost:5173` + `Access-Control-Allow-Credentials: true` 를 보내야 함
  - 프론트 fetch가 `credentials: 'include'` 여야 함 (현재 `packages/api/src/client.ts` 의 default는 `'same-origin'`)
- 셋 중 하나라도 빠지면 사용자 체감으로는 "쿠키가 안 박힘" 과 동일.

### (c) `CLIENT_REDIRECT_URL` 환경 분기
- 백엔드가 콜백 후 보내는 redirect 도착지(`CLIENT_REDIRECT_URL`)가 prod 도메인으로 hardcoded면 로컬 검증 시 prod 도메인으로 가버림.

### 결론
prod 백엔드 한 대만으로는 이 모든 제약을 동시에 만족시키기 어렵다. **로컬에서 백엔드를 직접 실행하고 dev 전용 OAuth 콜백 URI / `CLIENT_REDIRECT_URL`을 사용하는 패턴** 이 표준이다.

## 옵션 비교

| 옵션 | 작업량 | 비고 |
|---|---|---|
| **1. 로컬에서 백엔드 직접 실행** | 중 | 가장 흔한 dev 표준. 백엔드 레포 접근 + 로컬 실행 가이드 + Google OAuth 콘솔에 dev 콜백 URI 추가 등록 필요. **추천** |
| 2. GCP에 dev 인스턴스 별도 배포 | 큼 | 인프라 비용/관리. 동아리 규모 프로젝트엔 과함 |
| 3. prod 백엔드를 그대로 쓰되 redirect URI를 동적 파라미터로 받게 백엔드 변경 | 큼 | 보안 검토 필요. 일반적이지 않음 |

**결정:** 옵션 1 + 그 위에 **Vite dev proxy로 same-origin 환경**을 만든다. 이 조합이 프론트 코드 변경(`client.ts`, `LoginPage.tsx`) 없이 환경 설정만으로 끝나는 가장 깨끗한 길.

### Vite proxy + 옵션 1의 흐름 (왜 same-origin이 되는가)

1. 사용자: `http://localhost:5173/` → LoginPage → "Google로 로그인" 클릭
2. 브라우저: `http://localhost:5173/api/v1/auth/google` 로 navigation (LoginPage가 `${VITE_API_URL}/api/v1/auth/google` 로 redirect — `VITE_API_URL=http://localhost:5173` 이므로 결과적으로 자기 자신)
3. Vite dev server: `/api`로 시작하는 요청을 proxy로 받아 `http://localhost:8080` (로컬 백엔드)로 forward
4. 로컬 백엔드: Google로 302, 브라우저가 google.com으로 직접 이동 (proxy 무관)
5. Google: 인증 후 `http://localhost:8080/api/v1/auth/google/callback` 로 직접 콜백 (Google에 사전 등록된 dev 콜백 URI)
6. 로컬 백엔드: 쿠키 set (`Domain=localhost`) + 302 `Location: http://localhost:5173/applications`
7. 브라우저: `http://localhost:5173/applications` 도착. 쿠키는 host=localhost로 박혀있음 (port 무시). 이후 SPA의 fetch는 `http://localhost:5173/api/...` 로 same-origin 호출 → Vite proxy → 백엔드. 쿠키 자동 첨부.

→ 결과적으로 fetch는 same-origin이라 `client.ts`의 `'same-origin'` default 그대로 동작, CORS 우회, 쿠키 분기 우회.

## 작업 계획 (실제 진행 시)

### A. 사전 조건 (백엔드 담당자에게 확인/요청)

- [ ] 로컬 백엔드 실행 방법 (README / docker compose / `./gradlew bootRun` 등)
- [ ] 로컬 백엔드 포트 (가정: `http://localhost:8080` — 다르면 아래 설정값도 그 포트로)
- [ ] **Google OAuth 콘솔에 dev 콜백 URI 추가 등록**: `http://localhost:8080/api/v1/auth/google/callback`
- [ ] 백엔드 dev 환경변수에:
  - `OAUTH_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback` (또는 그에 준하는 키)
  - `CLIENT_REDIRECT_URL=http://localhost:5173/applications`
- [ ] (가능하면) dev 모드에서 쿠키 `Secure` 속성을 빼거나 `Domain`을 `localhost` 또는 미설정으로

### B. 프론트 작업

#### 1. 환경 변수
- [ ] `apps/admin/.env.local` 생성:
  ```
  VITE_API_URL=http://localhost:5173
  ```
  (Vite는 `.env.local` 을 dev에서 자동 로드)

#### 2. Vite dev proxy
- [ ] `apps/admin/vite.config.ts` 의 `server.proxy` 에 `/api` → 로컬 백엔드 추가:
  ```ts
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  ```

#### 3. (확인) `.gitignore`
- [ ] `.env.local` 또는 `.env*.local` 패턴이 gitignore에 있는지 확인. 없으면 추가

### C. 검증 (로컬에서)

- [ ] 로컬 백엔드 실행 (`http://localhost:8080`)
- [ ] `pnpm dev:admin` (`http://localhost:5173`)
- [ ] `http://localhost:5173/` 진입 → LoginPage 표시
- [ ] "Google로 로그인" → Google 인증 → `http://localhost:5173/applications` 도착
- [ ] DevTools → Application → Cookies → `http://localhost` 항목에 `access_token`, `refresh_token` 존재
- [ ] DevTools → Network → 어드민 첫 데이터 fetch (예: `/api/v1/admin/applications`) 200 응답
- [ ] 사이드바 메뉴 이동, 데이터 정상 로딩

### D. 트러블슈팅 가이드

- **OAuth 시작이 vite 404** → `vite.config.ts` proxy 매칭 패턴 확인
- **콜백 후 빈 페이지/404** → 백엔드 `CLIENT_REDIRECT_URL` 값 재확인 (백엔드 로그)
- **쿠키 미생성** → 백엔드 `Set-Cookie` 헤더 확인. `Secure` 속성이 HTTP localhost set을 막고 있으면 백엔드 dev 모드에서 빼야 함
- **쿠키 있는데 fetch 401** → 쿠키 `Domain` 속성 확인. prod 도메인으로 박혀있으면 백엔드 dev 모드에서 `Domain` 미설정 또는 `localhost`로
- **CORS 에러** → 본 셋업에서는 same-origin이라 안 걸려야 정상. 걸리면 Vite proxy 설정이 안 먹은 것 (`changeOrigin: true` 누락 또는 path 매칭 실패)

## 비-목표 / 본 라운드 범위 밖

- **prod 도메인(`https://admin.dddstudy.kr`)에 어드민 프론트 정적 호스팅 셋업** — 별도 인프라 라운드. 이게 끝나야 prod에서도 OAuth가 동작
- **백엔드 코드 변경** — 본 라운드는 백엔드의 환경변수/Google OAuth 콘솔 등록만 협조 받음
- **`packages/api/src/client.ts` 의 credentials 변경** — 이 셋업에서는 same-origin이므로 그대로 OK
- **`apps/admin/src/pages/login/LoginPage.tsx` 변경** — `${VITE_API_URL}/api/v1/auth/google` 그대로, `VITE_API_URL`만 환경에 따라 다름

## 향후 라운드 후보 (이 일과 연관)

1. **(블로커 #1) orval mutator 부활** — 현재 `pnpm build:admin`이 `packages/api/src/generated/` 부재로 fail. 본 OAuth 검증과는 별개지만 prod 배포의 선행 조건
2. **(블로커 #2) 어드민 프론트 prod 배포 셋업** — `pnpm build:admin` 산출물을 `https://admin.dddstudy.kr` 에 정적 호스팅 (nginx try_files SPA fallback 등)
3. **(본 문서의 후속) 본 계획을 정식 spec → plan → 구현으로 진행** — 백엔드 사전 조건 충족된 후

## 참고 커밋 / 문서

- 인증 마무리 라운드 스펙: [`docs/superpowers/specs/2026-04-28-admin-auth-completion-design.md`](./2026-04-28-admin-auth-completion-design.md)
- 인증 마무리 라운드 플랜: [`docs/superpowers/plans/2026-04-28-admin-auth-completion.md`](../plans/2026-04-28-admin-auth-completion.md)
- LoginPage OAuth 연결 커밋: `4165782`
- API client 팩토리 + 401 인터셉터 커밋: `ff9e1b7`
