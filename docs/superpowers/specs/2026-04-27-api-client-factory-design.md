# API 클라이언트 팩토리 패턴 마이그레이션

## 배경

`packages/api/src/client.ts`는 모듈 레벨 전역 싱글턴(`_baseUrl` + `apiFetch`)으로 구성되어 있다.
현재 구조의 두 가지 결함:

1. **비-JSON 응답 처리 불가** — `Content-Type: text/csv` 등 non-JSON 응답은 무조건 `ApiError`를 throw. `earlyNotificationAPI.exportAdminCsv()`가 이미 이 이유로 항상 실패한다.
2. **401 인터셉터 없음** — access_token 만료 시 자동 갱신 로직이 없어 사용자가 강제 로그아웃된다.

## 목표

- `createApiClient` 팩토리 함수 도입으로 설정 override 가능한 클라이언트 인스턴스 생성
- blob/text responseType 지원
- 401 수신 시 refresh → 큐잉 → 재시도 인터셉터 구현
- 기존 도메인 API 파일(`auth/api.ts`, `cohort/api.ts` 등) 변경 최소화

## 인증 구조 (참고)

| 쿠키 | 만료 | path 제한 |
|---|---|---|
| `access_token` | 24시간 | 전 경로 (자동 전송) |
| `refresh_token` | 7일 | `/api/v1/auth/refresh` 전용 |

same-origin 요청이므로 `credentials: 'same-origin'` (기본값)으로 쿠키 자동 전송.
`Authorization` 헤더 불필요.

## 설계

### 인터페이스

```ts
interface ApiClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials; // default: 'same-origin'
  refreshTokenPath?: string;        // default: '/api/v1/auth/refresh'
  onUnauthorized?: () => void;      // refresh 실패 시 호출
}

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  responseType?: 'json' | 'blob' | 'text'; // default: 'json'
  signal?: AbortSignal;
}

interface ApiClient {
  get:    <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  post:   <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  patch:  <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  put:    <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  delete: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
}
```

### 싱글턴 관리

기존 `configureApi(baseUrl)` API를 유지해 앱 진입점 코드 변경을 최소화한다.

```ts
// packages/api/src/client.ts
export let apiClient: ApiClient;

export function configureApi(baseUrl: string, options?: Omit<ApiClientConfig, 'baseUrl'>): void {
  apiClient = createApiClient({ baseUrl, ...options });
}
```

앱 초기화 시 `onUnauthorized`를 주입한다:

```ts
// apps/admin/src/main.tsx
configureApi(import.meta.env.VITE_API_URL, {
  onUnauthorized: () => router.navigate('/login'),
});
```

refresh는 클라이언트 내부에서 raw `fetch`로 직접 호출해 `auth/api.ts`와의 순환 의존성을 방지한다.

### responseType 처리

| responseType | 응답 처리 | ApiResponse 래퍼 체크 |
|---|---|---|
| `'json'` (기본) | `res.json()` → `body.data` 반환 | O |
| `'blob'` | `res.blob()` 직접 반환 | X |
| `'text'` | `res.text()` 직접 반환 | X |

CSV export 수정 예:

```ts
// early-notification/api.ts
apiClient.get<Blob>(`${BASE}/export/csv`, { responseType: 'blob' })
```

### 401 큐잉 흐름

클로저로 인스턴스별 상태 격리. `isRefreshing`과 `waitQueue`는 팩토리 호출마다 독립적으로 생성된다.

```
fetch 실행
  ├─ 200 → responseType 분기 → 반환
  └─ 401 → isRefreshing?
               ├─ true  → waitQueue에 Promise push → refresh 완료 대기 → 재시도
               └─ false → isRefreshing = true
                            → raw fetch(refreshTokenPath) 호출
                            ├─ 성공 → waitQueue resolve → 재시도 → isRefreshing=false
                            └─ 실패 → waitQueue reject → onUnauthorized() → isRefreshing=false
```

## 마이그레이션 범위

| 파일 | 변경 내용 |
|---|---|
| `packages/api/src/client.ts` | `createApiClient` 구현, `apiClient` 싱글턴 export, `api` 객체 제거 |
| `packages/api/src/index.ts` | `api` 대신 `apiClient` export |
| `apps/admin/src/main.tsx` | `configureApi`에 `onUnauthorized` 옵션 추가 |
| `packages/api/src/*/api.ts` (9개) | `apiFetch` → `apiClient.get/post/...` 교체 |
| `packages/api/src/early-notification/api.ts` | 위 교체 + `responseType: 'blob'` 옵션 추가 |
| `apps/admin/src/pages/applications/ApplicationsPage.tsx` | `api.*` → `apiClient.*` 교체 |
| `apps/admin/src/pages/semesters/SemestersPage.tsx` | `api.*` → `apiClient.*` 교체 |

도메인 파일의 export 이름(`authAPI`, `cohortAPI` 등)과 hooks/queries는 변경 없음.

## 초기화 전 접근 가드

`configureApi` 호출 전에 `apiClient`를 사용하면 명시적 에러를 throw한다:

```ts
export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error("API client is not configured. Call configureApi(baseUrl) before using the api client.");
  }
  return apiClient;
}
```

도메인 파일에서 `apiClient` 대신 `getApiClient()`를 사용한다.
