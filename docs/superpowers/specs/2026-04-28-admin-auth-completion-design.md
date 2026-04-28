# 어드민 인증 마무리 (Google OAuth · 인증 가드 · 회원가입 정리)

## 배경

`apps/admin`의 인증 인프라는 다음과 같은 상태로 부분 완료되어 있다.

**완료된 인프라**
- `packages/api/src/auth/`에 `authAPI` (Google 콜백 / 리프레시 / 로그아웃 / 탈퇴) + `useRefreshToken` / `useLogout` / `useWithdrawal` 훅
- `packages/api/src/client.ts`에 401 → `/api/v1/auth/refresh` POST → 큐잉 재시도 → 실패 시 `onUnauthorized()` 콜백 인터셉터
- `apps/admin/src/main.tsx`에 `configureApi(apiUrl, { onUnauthorized: () => window.location.replace("/") })`

**미완료 (`progress.md` 공통 인프라 ⬜ 항목)**
- Google OAuth 실제 연결 — `LoginPage.tsx`의 GoogleButton이 그냥 `/applications`로 SPA navigate
- 인증 보호 라우트 — `shared/lib/auth.ts`의 `requireAuth()`가 빈 stub
- 사용하지 않는 회원가입 라우트/페이지 잔존 (`/register`, `pages/sign-up/`, LoginPage 하단 링크)

## 스코프

이번 라운드에 포함:
- **A.** Google OAuth 실제 연결
- **B.** 인증 보호 라우트 (Minimal — 별도 가드 없이 401 인터셉터에 위임)
- **E.** 회원가입 관련 코드/라우트/링크 삭제

이번 라운드에 **제외**:
- **C.** 로그아웃 UI / 사이드바 footer 처리 — 본 라운드 비대상. 사이드바 footer와 모바일 헤더 우측 Avatar는 현재 placeholder 그대로 둔다.
- **D.** 로그인 사용자 컨텍스트 (me) — 백엔드에 `/me` 엔드포인트가 없고 access_token이 httpOnly 쿠키라 JS에서 디코드 불가. 본 라운드에서는 다루지 않음.
- **F.** 회원 탈퇴 UI — 본 라운드 비대상.

## 백엔드 의존성 (확인 사항)

OpenAPI 스펙(`https://admin.dddstudy.kr/api-docs-json`) 확인 결과:

| 엔드포인트 | 메서드 | 동작 |
|---|---|---|
| `/api/v1/auth/google` | GET | Google 로그인 페이지로 리다이렉트 |
| `/api/v1/auth/google/callback` | GET | 쿠키 발급 후 **`CLIENT_REDIRECT_URL`** 로 리다이렉트 |
| `/api/v1/auth/refresh` | POST | 두 쿠키 모두 갱신 |
| `/api/v1/auth/logout` | POST | 쿠키 삭제 (204 No Content) |

**가정**: 백엔드의 `CLIENT_REDIRECT_URL` 환경변수는 어드민 도메인의 보호된 페이지(예: `${ADMIN_ORIGIN}/applications`)로 설정되어 있다. 본 설계는 이를 전제로 한다.

## 설계

### A. Google OAuth 연결

**파일:** `apps/admin/src/pages/login/LoginPage.tsx`

- `GoogleButton`의 `onClick`을 외부 redirect로 교체:
  ```tsx
  onClick={() => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`
  }}
  ```
- `useNavigate` import 제거. `paths` import도 register 링크 제거 후 더는 필요 없으면 함께 제거.
- 콜백 흐름은 100% 백엔드 주도이므로 프론트에 별도 콜백 페이지/쿼리 처리를 두지 않는다.

### B. 인증 가드 (Minimal)

**파일:** `apps/admin/src/shared/lib/auth.ts` (삭제), `apps/admin/src/pages/index.tsx`

- `shared/lib/auth.ts` 파일을 **삭제**한다. 빈 stub 함수만 있어 데드코드.
- `pages/index.tsx`의 라우트에 별도 `loader`로 인증 가드를 추가하지 않는다.
- 보호된 페이지 진입 시 첫 데이터 fetch가 401을 받으면 `main.tsx`에 이미 연결된 `onUnauthorized` 콜백이 `window.location.replace("/")`로 처리한다.
- 트레이드오프: 401 응답이 돌아올 때까지 짧은 순간 빈 어드민 UI가 깜빡일 수 있다. 이번 라운드에서는 허용한다.

### E. 회원가입 관련 삭제

별도 회원가입 로직이 없으므로 (가입은 Google OAuth 첫 로그인이 곧 가입) 잔존 placeholder를 모두 제거한다.

- `apps/admin/src/pages/sign-up/` 디렉터리 전체 삭제
- `apps/admin/src/pages/index.tsx`의 `/register` 라우트 항목 제거
- `apps/admin/src/pages/login/LoginPage.tsx`에서 `Link to={paths.register}` 블록 제거
- `apps/admin/src/shared/lib/paths.ts`의 `register: "/register"` 항목 제거

### 부수 정리 (스코프 내 데드코드)

- `packages/api/src/auth/api.ts`의 `googleLoginCallback` 메서드 삭제 (백엔드가 redirect로 처리하므로 프론트 호출 경로 없음)
- `packages/api/src/auth/types.ts`의 `PostGoogleLoginResponse` 타입 삭제
- `progress.md`의 "공통 인프라 (admin)" 섹션 갱신:
  - "Google OAuth 실제 연결" ⬜ → ✅
  - "인증 보호 라우트" ⬜ → ✅ (Minimal: 401 인터셉터 위임)
  - 회원가입 관련 항목은 "MVP 제외 (별도 회원가입 로직 없음, Google OAuth 첫 로그인이 곧 가입)" 로 명시

### 디렉터리 변경 요약

```
apps/admin/src/
├── pages/
│   ├── login/LoginPage.tsx                    # 수정 (외부 redirect, register 링크 제거)
│   ├── sign-up/                               # 삭제
│   └── index.tsx                              # 수정 (/register 라우트 제거)
└── shared/lib/
    ├── auth.ts                                # 삭제
    └── paths.ts                               # 수정 (register 제거)

packages/api/src/auth/
├── api.ts                                     # 수정 (googleLoginCallback 제거)
└── types.ts                                   # 수정 (PostGoogleLoginResponse 제거)
```

사이드바(`SideBar.tsx`), 모바일 헤더(`MobileHeader.tsx`), `widgets/navigation/*`, `entities/` 레이어는 본 라운드에서 변경하지 않는다.

## 검증

- `pnpm lint` 통과
- `pnpm build:admin` 통과
- (수동) 실제 백엔드 연동 환경에서 다음 흐름 1회 검증 (사용자가 직접 수행):
  1. `/` 진입 → "Google로 로그인" 클릭 → 백엔드 `/auth/google` 으로 redirect
  2. Google 인증 후 `CLIENT_REDIRECT_URL` 도착지(예: `/applications`)에 정상 진입, 데이터 정상 로딩
  3. 로그인 직후 `/`로 직접 이동 시 정상 LoginPage 렌더 (보호 라우트가 없으므로 막지는 않음 — 의도)
  4. 쿠키 만료 상황 시뮬레이션 후 보호된 URL 직접 접근 → 첫 fetch 401 → `/` 자동 리다이렉트

## 비-목표

- 로그아웃 UI / 사이드바 footer / 모바일 Avatar 동작 — 별도 라운드
- 사용자 정보(이메일/이름/프로필 사진) 표시 — `/me` 엔드포인트 추가 후 별도 라운드
- 회원가입 별도 흐름 — 존재하지 않음
- 회원 탈퇴 UI — 별도 라운드
- 권한(roles) 기반 접근 제어 — 별도 라운드
