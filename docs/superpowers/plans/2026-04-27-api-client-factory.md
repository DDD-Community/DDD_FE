# API 클라이언트 팩토리 패턴 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `packages/api/src/client.ts`를 팩토리 함수 기반으로 교체해 blob/text responseType과 401 자동 갱신(요청 큐잉) 인터셉터를 지원한다.

**Architecture:** `createApiClient(config)` 팩토리가 클로저로 `isRefreshing`/`waitQueue` 상태를 격리한 `ApiClient` 인스턴스를 반환한다. 앱 진입점(`main.tsx`)에서 `configureApi(baseUrl, { onUnauthorized })` 로 싱글턴을 초기화하고, 도메인 파일들은 `getApiClient()` 가드 함수를 통해 접근한다.

**Tech Stack:** TypeScript, native `fetch`, `packages/api` 내부 — 외부 의존성 추가 없음.

---

## 파일 구조

| 파일 | 역할 |
|---|---|
| `packages/api/src/client.ts` | **전면 교체** — `createApiClient`, `getApiClient`, `configureApi`, 인터페이스 타입 |
| `packages/api/src/index.ts` | **수정** — `api` 제거, `getApiClient` 추가 |
| `packages/api/src/auth/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/cohort/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/application/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/interview/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/blog/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/project/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/discord/api.ts` | `apiFetch` → `getApiClient().*` |
| `packages/api/src/storage/api.ts` | `apiFetch` → `getApiClient().*` (FormData 그대로) |
| `packages/api/src/early-notification/api.ts` | `apiFetch` → `getApiClient().*` + CSV에 `responseType: 'blob'` |
| `apps/admin/src/main.tsx` | `configureApi`에 `onUnauthorized` 추가 |
| `apps/admin/src/pages/applications/ApplicationsPage.tsx` | `api.get` → `getApiClient().get` |
| `apps/admin/src/pages/semesters/SemestersPage.tsx` | `api.get` → `getApiClient().get` |

> **참고:** 이 프로젝트에는 테스트 인프라가 없다. 각 태스크의 검증은 TypeScript 타입 체커(`pnpm --filter @ddd/api typecheck`)로 한다.

---

## Task 1: `client.ts` 전면 교체

**Files:**
- Modify: `packages/api/src/client.ts`

- [ ] **Step 1: `client.ts`를 아래 내용으로 완전히 교체한다**

```ts
import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

export interface ApiClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  refreshTokenPath?: string;
  onUnauthorized?: () => void;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
  responseType?: "json" | "blob" | "text";
}

export interface ApiClient {
  get: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  post: <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  patch: <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  put: <T>(path: string, body: unknown, options?: ApiRequestOptions) => Promise<T>;
  delete: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
}

function resolveBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  ) {
    return body;
  }
  return JSON.stringify(body);
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const {
    baseUrl,
    credentials = "same-origin",
    refreshTokenPath = "/api/v1/auth/refresh",
    onUnauthorized,
  } = config;

  let isRefreshing = false;
  let waitQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

  function buildUrl(path: string): string {
    return new URL(path, baseUrl).toString();
  }

  async function doRefresh(): Promise<void> {
    const res = await fetch(buildUrl(refreshTokenPath), {
      method: "POST",
      credentials,
    });
    if (!res.ok) throw new Error("Token refresh failed");
  }

  async function parseResponse<T>(
    res: Response,
    responseType: "json" | "blob" | "text",
  ): Promise<T> {
    if (responseType === "blob") return res.blob() as unknown as T;
    if (responseType === "text") return res.text() as unknown as T;

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      if (!res.ok) throw new ApiError("UNKNOWN_ERROR", "No content returned from the server.");
      return null as T;
    }

    const contentType = res.headers.get("Content-Type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      throw new ApiError("UNKNOWN_ERROR", text || "Unexpected response format from the server.");
    }

    let body: ApiResponse<T>;
    try {
      body = (await res.json()) as ApiResponse<T>;
    } catch (error) {
      throw new ApiError(
        "UNKNOWN_ERROR",
        error instanceof Error ? error.message : String(error),
      );
    }

    if (body.code !== "SUCCESS") {
      throw new ApiError(body.code ?? "UNKNOWN_ERROR", body.message);
    }

    return body.data as T;
  }

  async function execute<T>(
    path: string,
    method: string,
    body?: unknown,
    options?: ApiRequestOptions,
    isRetry = false,
  ): Promise<T> {
    const { responseType = "json", signal, headers: optHeaders, ...restOptions } =
      options ?? {};

    const headers = new Headers(optHeaders as HeadersInit | undefined);
    const hasBody = body !== undefined && body !== null;
    const methodCanHaveBody = ["POST", "PATCH", "PUT"].includes(method);

    if (
      !headers.has("Content-Type") &&
      !(body instanceof FormData) &&
      (methodCanHaveBody || hasBody)
    ) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(buildUrl(path), {
      ...restOptions,
      method,
      body: resolveBody(body),
      headers,
      credentials,
      signal,
    });

    if (res.status === 401 && !isRetry) {
      return handleUnauthorized<T>(path, method, body, options);
    }

    if (res.status === 401) {
      onUnauthorized?.();
      throw new ApiError("UNAUTHORIZED", "Session expired. Please log in again.");
    }

    return parseResponse<T>(res, responseType);
  }

  async function handleUnauthorized<T>(
    path: string,
    method: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    if (isRefreshing) {
      await new Promise<void>((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      });
      return execute<T>(path, method, body, options, true);
    }

    isRefreshing = true;
    try {
      await doRefresh();
      waitQueue.forEach(({ resolve }) => resolve());
      return execute<T>(path, method, body, options, true);
    } catch (err) {
      waitQueue.forEach(({ reject }) => reject(err));
      onUnauthorized?.();
      throw new ApiError("UNAUTHORIZED", "Session expired. Please log in again.");
    } finally {
      isRefreshing = false;
      waitQueue = [];
    }
  }

  return {
    get: <T>(path: string, options?: ApiRequestOptions) =>
      execute<T>(path, "GET", undefined, options),
    post: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
      execute<T>(path, "POST", body, options),
    patch: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
      execute<T>(path, "PATCH", body, options),
    put: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
      execute<T>(path, "PUT", body, options),
    delete: <T>(path: string, options?: ApiRequestOptions) =>
      execute<T>(path, "DELETE", undefined, options),
  };
}

let _apiClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  if (!_apiClient) {
    throw new Error(
      "API client is not configured. Call configureApi(baseUrl) before using the api client.",
    );
  }
  return _apiClient;
}

export function configureApi(
  baseUrl: string,
  options?: Omit<ApiClientConfig, "baseUrl">,
): void {
  _apiClient = createApiClient({ baseUrl, ...options });
}
```

- [ ] **Step 2: 타입 체크 실행**

```bash
pnpm --filter @ddd/api typecheck
```

Expected: `0 errors` (도메인 파일들이 아직 `apiFetch`를 import하므로 오류가 날 수 있음 — Task 3~6에서 수정 예정. `client.ts` 자체의 타입 오류가 없는지 확인)

- [ ] **Step 3: 커밋**

```bash
git add packages/api/src/client.ts
git commit -m "feat(api): createApiClient 팩토리 + 401 큐잉 인터셉터 구현"
```

---

## Task 2: `index.ts` export 업데이트

**Files:**
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: `index.ts` 첫 줄의 client export를 수정한다**

현재:
```ts
export { api, configureApi } from "./client";
```

변경 후:
```ts
export { configureApi, getApiClient } from "./client";
export type { ApiClient, ApiClientConfig, ApiRequestOptions } from "./client";
```

- [ ] **Step 2: 커밋**

```bash
git add packages/api/src/index.ts
git commit -m "feat(api): index에서 api 객체 제거, getApiClient export"
```

---

## Task 3: `auth/api.ts` + `cohort/api.ts` 마이그레이션

**Files:**
- Modify: `packages/api/src/auth/api.ts`
- Modify: `packages/api/src/cohort/api.ts`

- [ ] **Step 1: `auth/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  PostGoogleLoginResponse,
  PostRefreshTokenResponse,
} from "./types";

const AUTH_BASE_URL = "/api/v1/auth" as const;

export const authAPI = {
  googleLoginCallback: () =>
    getApiClient().get<PostGoogleLoginResponse>(`${AUTH_BASE_URL}/google`),

  refreshToken: () =>
    getApiClient().post<PostRefreshTokenResponse>(`${AUTH_BASE_URL}/refresh`, null),

  logout: () =>
    getApiClient().post<void>(`${AUTH_BASE_URL}/logout`, null),

  withdrawal: () =>
    getApiClient().delete<void>(`${AUTH_BASE_URL}/withdrawal`),
};
```

- [ ] **Step 2: `cohort/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  PostCreateCohortRequest,
  PostCreateCohortResponse,
  GetCohortsResponse,
  GetCohortParams,
  GetCohortResponse,
  PutUpdateCohortParams,
  PutUpdateCohortRequest,
  PutUpdateCohortResponse,
  DeleteCohortParams,
  PutUpdateCohortPartsParams,
  PutUpdateCohortPartsRequest,
  PutUpdateCohortPartsResponse,
} from "./types";

const COHORT_BASE_URL = "/api/v1/cohorts" as const;

export const cohortAPI = {
  createCohort: ({ payload }: { payload: PostCreateCohortRequest }) =>
    getApiClient().post<PostCreateCohortResponse>(COHORT_BASE_URL, payload),

  getCohorts: () => getApiClient().get<GetCohortsResponse>(COHORT_BASE_URL),

  getCohort: ({ params }: { params: GetCohortParams }) =>
    getApiClient().get<GetCohortResponse>(`${COHORT_BASE_URL}/${params.id}`),

  updateCohort: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortParams;
    payload: PutUpdateCohortRequest;
  }) =>
    getApiClient().put<PutUpdateCohortResponse>(
      `${COHORT_BASE_URL}/${params.id}`,
      payload,
    ),

  deleteCohort: ({ params }: { params: DeleteCohortParams }) =>
    getApiClient().delete<void>(`${COHORT_BASE_URL}/${params.id}`),

  updateCohortParts: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortPartsParams;
    payload: PutUpdateCohortPartsRequest;
  }) =>
    getApiClient().put<PutUpdateCohortPartsResponse>(
      `${COHORT_BASE_URL}/${params.id}/parts`,
      payload,
    ),
};
```

- [ ] **Step 3: 타입 체크**

```bash
pnpm --filter @ddd/api typecheck
```

Expected: auth, cohort 관련 오류 해소. 나머지 도메인 파일 오류는 후속 태스크에서 처리.

- [ ] **Step 4: 커밋**

```bash
git add packages/api/src/auth/api.ts packages/api/src/cohort/api.ts
git commit -m "feat(api): auth/cohort api.ts → getApiClient() 마이그레이션"
```

---

## Task 4: `application/api.ts` + `interview/api.ts` 마이그레이션

**Files:**
- Modify: `packages/api/src/application/api.ts`
- Modify: `packages/api/src/interview/api.ts`

- [ ] **Step 1: `application/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationsResponse,
  GetAdminApplicationParams,
  GetAdminApplicationResponse,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PatchApplicationStatusResponse,
  PostSaveApplicationDraftRequest,
  PostSaveApplicationDraftResponse,
  PostSubmitApplicationRequest,
  PostSubmitApplicationResponse,
  GetMyApplicationResponse,
} from "./types";

const APPLICATION_BASE_URL = "/api/v1/application" as const;

export const applicationAPI = {
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));
    if (params.status !== undefined) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return getApiClient().get<GetAdminApplicationsResponse>(
      `${APPLICATION_BASE_URL}/admin${query ? `?${query}` : ""}`,
    );
  },

  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    getApiClient().get<GetAdminApplicationResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}`,
    ),

  patchApplicationStatus: ({
    params,
    payload,
  }: {
    params: PatchApplicationStatusParams;
    payload: PatchApplicationStatusRequest;
  }) =>
    getApiClient().patch<PatchApplicationStatusResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}/status`,
      payload,
    ),

  saveApplicationDraft: ({
    payload,
  }: {
    payload: PostSaveApplicationDraftRequest;
  }) =>
    getApiClient().post<PostSaveApplicationDraftResponse>(
      `${APPLICATION_BASE_URL}/draft`,
      payload,
    ),

  submitApplication: ({
    payload,
  }: {
    payload: PostSubmitApplicationRequest;
  }) =>
    getApiClient().post<PostSubmitApplicationResponse>(
      `${APPLICATION_BASE_URL}/submit`,
      payload,
    ),

  getMyApplication: () =>
    getApiClient().get<GetMyApplicationResponse>(`${APPLICATION_BASE_URL}/my`),
};
```

- [ ] **Step 2: `interview/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  GetInterviewSlotsParams,
  GetInterviewSlotsResponse,
  GetInterviewSlotParams,
  GetInterviewSlotResponse,
  PostCreateInterviewSlotRequest,
  PostCreateInterviewSlotResponse,
  PatchUpdateInterviewSlotParams,
  PatchUpdateInterviewSlotRequest,
  PatchUpdateInterviewSlotResponse,
  DeleteInterviewSlotParams,
  PostCreateInterviewReservationRequest,
  PostCreateInterviewReservationResponse,
  DeleteInterviewReservationParams,
} from "./types";

const INTERVIEW_BASE_URL = "/api/v1/interview" as const;

export const interviewAPI = {
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));

    const query = searchParams.toString();
    return getApiClient().get<GetInterviewSlotsResponse>(
      `${INTERVIEW_BASE_URL}/slots${query ? `?${query}` : ""}`,
    );
  },

  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    getApiClient().get<GetInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`,
    ),

  createInterviewSlot: ({
    payload,
  }: {
    payload: PostCreateInterviewSlotRequest;
  }) =>
    getApiClient().post<PostCreateInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots`,
      payload,
    ),

  updateInterviewSlot: ({
    params,
    payload,
  }: {
    params: PatchUpdateInterviewSlotParams;
    payload: PatchUpdateInterviewSlotRequest;
  }) =>
    getApiClient().patch<PatchUpdateInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`,
      payload,
    ),

  deleteInterviewSlot: ({ params }: { params: DeleteInterviewSlotParams }) =>
    getApiClient().delete<void>(`${INTERVIEW_BASE_URL}/slots/${params.id}`),

  createInterviewReservation: ({
    payload,
  }: {
    payload: PostCreateInterviewReservationRequest;
  }) =>
    getApiClient().post<PostCreateInterviewReservationResponse>(
      `${INTERVIEW_BASE_URL}/reservations`,
      payload,
    ),

  deleteInterviewReservation: ({
    params,
  }: {
    params: DeleteInterviewReservationParams;
  }) =>
    getApiClient().delete<void>(
      `${INTERVIEW_BASE_URL}/reservations/${params.id}`,
    ),
};
```

- [ ] **Step 3: 타입 체크**

```bash
pnpm --filter @ddd/api typecheck
```

- [ ] **Step 4: 커밋**

```bash
git add packages/api/src/application/api.ts packages/api/src/interview/api.ts
git commit -m "feat(api): application/interview api.ts → getApiClient() 마이그레이션"
```

---

## Task 5: `blog/api.ts` + `project/api.ts` + `discord/api.ts` 마이그레이션

**Files:**
- Modify: `packages/api/src/blog/api.ts`
- Modify: `packages/api/src/project/api.ts`
- Modify: `packages/api/src/discord/api.ts`

- [ ] **Step 1: `blog/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  GetBlogPostsParams,
  GetBlogPostsResponse,
  GetBlogPostParams,
  GetBlogPostResponse,
  PostCreateBlogPostRequest,
  PostCreateBlogPostResponse,
  PutUpdateBlogPostParams,
  PutUpdateBlogPostRequest,
  PutUpdateBlogPostResponse,
  DeleteBlogPostParams,
} from "./types";

const BLOG_BASE_URL = "/api/v1/blog" as const;

export const blogAPI = {
  getBlogPosts: ({ params }: { params: GetBlogPostsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return getApiClient().get<GetBlogPostsResponse>(
      `${BLOG_BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getBlogPost: ({ params }: { params: GetBlogPostParams }) =>
    getApiClient().get<GetBlogPostResponse>(`${BLOG_BASE_URL}/${params.id}`),

  createBlogPost: ({ payload }: { payload: PostCreateBlogPostRequest }) =>
    getApiClient().post<PostCreateBlogPostResponse>(
      `${BLOG_BASE_URL}/admin`,
      payload,
    ),

  updateBlogPost: ({
    params,
    payload,
  }: {
    params: PutUpdateBlogPostParams;
    payload: PutUpdateBlogPostRequest;
  }) =>
    getApiClient().put<PutUpdateBlogPostResponse>(
      `${BLOG_BASE_URL}/admin/${params.id}`,
      payload,
    ),

  deleteBlogPost: ({ params }: { params: DeleteBlogPostParams }) =>
    getApiClient().delete<void>(`${BLOG_BASE_URL}/admin/${params.id}`),
};
```

- [ ] **Step 2: `project/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  GetProjectsParams,
  GetProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
  PostCreateProjectRequest,
  PostCreateProjectResponse,
  PutUpdateProjectParams,
  PutUpdateProjectRequest,
  PutUpdateProjectResponse,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
  PutUpdateProjectMembersResponse,
} from "./types";

const PROJECT_BASE_URL = "/api/v1/project" as const;

export const projectAPI = {
  getProjects: ({ params }: { params: GetProjectsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.platform !== undefined)
      searchParams.set("platform", params.platform);
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return getApiClient().get<GetProjectsResponse>(
      `${PROJECT_BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getProject: ({ params }: { params: GetProjectParams }) =>
    getApiClient().get<GetProjectResponse>(`${PROJECT_BASE_URL}/${params.id}`),

  createProject: ({ payload }: { payload: PostCreateProjectRequest }) =>
    getApiClient().post<PostCreateProjectResponse>(
      `${PROJECT_BASE_URL}/admin`,
      payload,
    ),

  updateProject: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectParams;
    payload: PutUpdateProjectRequest;
  }) =>
    getApiClient().put<PutUpdateProjectResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}`,
      payload,
    ),

  deleteProject: ({ params }: { params: DeleteProjectParams }) =>
    getApiClient().delete<void>(`${PROJECT_BASE_URL}/admin/${params.id}`),

  updateProjectMembers: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectMembersParams;
    payload: PutUpdateProjectMembersRequest;
  }) =>
    getApiClient().put<PutUpdateProjectMembersResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}/members`,
      payload,
    ),
};
```

- [ ] **Step 3: `discord/api.ts` 전체를 교체한다**

```ts
import { getApiClient } from "../client";
import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordAuthorizeUrlResponse,
  GetDiscordOauthCallbackParams,
  GetDiscordLinkParams,
  GetDiscordLinkResponse,
} from "./types";

const DISCORD_BASE_URL = "/api/v1/discord" as const;

export const discordAPI = {
  getAuthorizeUrl: ({ params }: { params: GetDiscordAuthorizeUrlParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return getApiClient().get<GetDiscordAuthorizeUrlResponse>(
      `${DISCORD_BASE_URL}/authorize?${searchParams}`,
    );
  },

  oauthCallback: ({ params }: { params: GetDiscordOauthCallbackParams }) => {
    const searchParams = new URLSearchParams({
      code: params.code,
      state: params.state,
    });
    return getApiClient().get<void>(
      `${DISCORD_BASE_URL}/oauth/callback?${searchParams}`,
    );
  },

  getLink: ({ params }: { params: GetDiscordLinkParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return getApiClient().get<GetDiscordLinkResponse>(
      `${DISCORD_BASE_URL}/link?${searchParams}`,
    );
  },
};
```

- [ ] **Step 4: 타입 체크**

```bash
pnpm --filter @ddd/api typecheck
```

- [ ] **Step 5: 커밋**

```bash
git add packages/api/src/blog/api.ts packages/api/src/project/api.ts packages/api/src/discord/api.ts
git commit -m "feat(api): blog/project/discord api.ts → getApiClient() 마이그레이션"
```

---

## Task 6: `storage/api.ts` + `early-notification/api.ts` 마이그레이션

**Files:**
- Modify: `packages/api/src/storage/api.ts`
- Modify: `packages/api/src/early-notification/api.ts`

- [ ] **Step 1: `storage/api.ts` 전체를 교체한다**

FormData는 `resolveBody`가 그대로 통과시키므로 `post(path, formData)`만 하면 된다.

```ts
import { getApiClient } from "../client";
import type { PostUploadFileParams, PostUploadFileResponse } from "./types";

const STORAGE_BASE_URL = "/api/v1/storage" as const;

export const storageAPI = {
  uploadFile: ({
    params,
    payload,
  }: {
    params: PostUploadFileParams;
    payload: FormData;
  }) => {
    const searchParams = new URLSearchParams({ category: params.category });
    return getApiClient().post<PostUploadFileResponse>(
      `${STORAGE_BASE_URL}/upload?${searchParams}`,
      payload,
    );
  },
};
```

- [ ] **Step 2: `early-notification/api.ts` 전체를 교체한다**

`exportAdminCsv`에만 `{ responseType: 'blob' }` 옵션을 추가한다. 이 변경으로 현재 항상 실패하던 CSV 다운로드가 정상 동작한다.

```ts
import { getApiClient } from "../client";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsResponse,
  GetAdminEarlyNotificationsCsvParams,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
  PostSubscribeEarlyNotificationResponse,
} from "./types";

const EARLY_NOTIFICATION_BASE_URL = "/api/v1/early-notifications" as const;

export const earlyNotificationAPI = {
  getAdminEarlyNotifications: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsParams;
  }) => {
    const searchParams = new URLSearchParams({
      cohortId: String(params.cohortId),
    });
    if (params.onlyUnnotified !== undefined)
      searchParams.set("onlyUnnotified", String(params.onlyUnnotified));

    return getApiClient().get<GetAdminEarlyNotificationsResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin?${searchParams}`,
    );
  },

  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }) => {
    const searchParams = new URLSearchParams({
      cohortId: String(params.cohortId),
    });

    return getApiClient().get<Blob>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin/export/csv?${searchParams}`,
      { responseType: "blob" },
    );
  },

  sendBulkEarlyNotification: ({
    payload,
  }: {
    payload: PostSendBulkEarlyNotificationRequest;
  }) =>
    getApiClient().post<void>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin/send`,
      payload,
    ),

  subscribeEarlyNotification: ({
    payload,
  }: {
    payload: PostSubscribeEarlyNotificationRequest;
  }) =>
    getApiClient().post<PostSubscribeEarlyNotificationResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/subscribe`,
      payload,
    ),
};
```

- [ ] **Step 3: 전체 타입 체크 — 모든 오류가 해소되어야 한다**

```bash
pnpm --filter @ddd/api typecheck
```

Expected: `0 errors`

- [ ] **Step 4: 커밋**

```bash
git add packages/api/src/storage/api.ts packages/api/src/early-notification/api.ts
git commit -m "feat(api): storage/early-notification api.ts → getApiClient() 마이그레이션, CSV blob 수정"
```

---

## Task 7: `apps/admin` 업데이트

**Files:**
- Modify: `apps/admin/src/main.tsx`
- Modify: `apps/admin/src/pages/applications/ApplicationsPage.tsx`
- Modify: `apps/admin/src/pages/semesters/SemestersPage.tsx`

- [ ] **Step 1: `main.tsx`에서 `configureApi`에 `onUnauthorized` 콜백을 추가한다**

현재:
```ts
configureApi(apiUrl)
```

변경 후:
```ts
configureApi(apiUrl, {
  onUnauthorized: () => {
    window.location.replace("/");
  },
});
```

로그인 페이지는 `/` 경로다 (`paths.login = "/"`). `window.location.replace`는 브라우저 히스토리에 남기지 않아 뒤로가기 시 만료된 페이지로 돌아가지 않는다.

- [ ] **Step 2: `ApplicationsPage.tsx`에서 `api` import를 `getApiClient`로 교체한다**

현재:
```ts
import { api } from "@ddd/api"
```

변경 후:
```ts
import { getApiClient } from "@ddd/api"
```

그리고 `api.get<ApplicationInfo[]>(...)` 호출을 찾아:

현재:
```ts
const data = await api.get<ApplicationInfo[]>("/application")
```

변경 후:
```ts
const data = await getApiClient().get<ApplicationInfo[]>("/application")
```

- [ ] **Step 3: `SemestersPage.tsx`에서 `api` import를 `getApiClient`로 교체한다**

현재:
```ts
import { api } from "@ddd/api"
```

변경 후:
```ts
import { getApiClient } from "@ddd/api"
```

그리고:

현재:
```ts
return await api.get<SemesterInfo[]>("/semester")
```

변경 후:
```ts
return await getApiClient().get<SemesterInfo[]>("/semester")
```

- [ ] **Step 4: 어드민 앱 타입 체크**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: `0 errors`

- [ ] **Step 5: 커밋**

```bash
git add apps/admin/src/main.tsx \
        apps/admin/src/pages/applications/ApplicationsPage.tsx \
        apps/admin/src/pages/semesters/SemestersPage.tsx
git commit -m "feat(admin): configureApi onUnauthorized 추가, api 객체 → getApiClient() 교체"
```

---

## Task 8: 최종 검증

- [ ] **Step 1: 전체 패키지 타입 체크**

```bash
pnpm --filter @ddd/api typecheck && pnpm --filter @ddd/admin typecheck
```

Expected: 두 패키지 모두 `0 errors`

- [ ] **Step 2: `api` 혹은 `apiFetch` 잔존 참조 확인**

```bash
grep -r "import.*\bapiFetch\b\|from \"@ddd/api\".*\bapi\b" \
  packages/api/src apps/admin/src apps/web/src \
  --include="*.ts" --include="*.tsx" \
  | grep -v "getApiClient\|configureApi\|ApiClient\|ApiRequest\|node_modules\|generated"
```

Expected: 출력 없음 (잔존 참조 없음)

- [ ] **Step 3: 어드민 개발 서버 기동 후 수동 확인**

```bash
pnpm dev:admin
```

확인 항목:
1. 로그인 → 어드민 접근 정상
2. 기수 목록, 지원자 목록 등 데이터 로딩 정상
3. 브라우저 DevTools Network 탭에서 API 요청에 `same-origin` credentials 전송 확인

- [ ] **Step 4: 최종 커밋 (변경사항이 있는 경우)**

```bash
git add -p
git commit -m "fix(api): 마이그레이션 후 잔존 참조 정리"
```
