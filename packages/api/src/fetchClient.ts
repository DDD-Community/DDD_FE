import createClient, {
  type Client,
  type ClientPathsWithMethod,
  type FetchOptions,
  type MethodResponse,
} from "openapi-fetch";

import { ApiError, ErrorMessage, type ErrorMessageKey } from "./errors";
import type { paths } from "./generated/api";

export interface ApiConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  /**
   * 401 을 받았을 때 한 번 시도할 refresh 엔드포인트.
   *
   * `null` 이면 refresh 를 아예 시도하지 않고 401 을 그대로 돌려준다 — 지원자
   * 이메일 인증 세션처럼 refresh 계약이 없는 곳에서 헛요청과 재시도를 막는다.
   */
  refreshTokenPath?: string | null;
  onUnauthorized?: () => void;
}

type OpenApiClient = Client<paths>;
type PathsWith<M extends "get" | "post" | "put" | "patch" | "delete"> =
  ClientPathsWithMethod<OpenApiClient, M>;

interface BeWrapper {
  code?: string;
  message?: string;
  data?: unknown;
  meta?: unknown;
}

interface CursorMeta {
  nextCursor?: unknown;
  hasNext?: unknown;
}

function isCursorMeta(value: unknown): value is CursorMeta {
  return typeof value === "object" && value !== null;
}

export type UnwrapData<T> = T extends { data?: infer U }
  ? Exclude<NonNullable<U>, undefined>
  : T;

function isBeWrapper(value: unknown): value is BeWrapper {
  return (
    typeof value === "object" &&
    value !== null &&
    ("code" in value || "message" in value || "data" in value)
  );
}

/**
 * BE 응답 envelope `{ data: [...], meta: { nextCursor, hasNext } }` 를
 * SDK 의 페이지네이션 DTO 형태 `{ items, nextCursor?, hasMore }` 로 정규화한다.
 * meta 가 없으면 `data` 그대로 반환 (단순 배열 응답 호환).
 */
function normalizeCursorListPayload(payload: unknown[], meta: unknown): unknown {
  if (!isCursorMeta(meta)) return payload;
  const nextCursor = typeof meta.nextCursor === "string" ? meta.nextCursor : undefined;
  return {
    items: payload,
    nextCursor,
    hasMore: meta.hasNext === true,
  };
}

function toErrorCode(code: string | undefined): ErrorMessageKey {
  return (code ?? "UNKNOWN_ERROR") as ErrorMessageKey;
}

const HANGUL = /[가-힣]/;

/**
 * BE 에러를 화면에 띄울 ApiError 로 바꾼다.
 *
 * BE 는 일부 에러를 영문 그대로 내려주는데(401 → "Unauthorized"), 화면은 이 message 를
 * 그대로 렌더하므로 사용자에게 영어가 노출된다. 그래서 한국어 문구가 아닌 원문은
 * `ErrorMessage` 의 문구로 바꾼다.
 *
 * 반대로 한국어 원문은 그대로 쓴다 — BAD_REQUEST 의 message 는 `필드명: 사유` 형식이라
 * (`applicantPhone: 휴대폰 번호 형식이 올바르지 않습니다.`) 코드별 고정 문구로 덮으면
 * 어느 항목이 틀렸는지 알 수 없게 된다.
 */
function toApiError(
  code: string | undefined,
  message: string | undefined,
  status: number,
): ApiError {
  const key = toErrorCode(code);
  if (message && HANGUL.test(message)) return new ApiError(key, message);
  return new ApiError(
    key,
    ErrorMessage[key] ?? message ?? `Request failed with status ${status}`,
  );
}

class ApiClient {
  private client: OpenApiClient | null = null;

  // 401 refresh 큐 — 동시에 여러 요청이 401 을 받아도 refresh 는 한 번만 수행.
  private isRefreshing = false;
  private waitQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

  configure(config: ApiConfig): void {
    const credentials = config.credentials ?? "include";
    const refreshTokenPath =
      config.refreshTokenPath === null
        ? null
        : (config.refreshTokenPath ?? "/api/v1/auth/refresh");
    const baseUrl = config.baseUrl;
    const origin =
      baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const refreshUrl = refreshTokenPath
      ? new URL(refreshTokenPath, origin).toString()
      : null;
    const onUnauthorized = config.onUnauthorized;

    const doRefresh = async (): Promise<void> => {
      if (!refreshUrl) throw new Error("Token refresh is disabled");
      const res = await fetch(refreshUrl, { method: "POST", credentials });
      if (!res.ok) throw new Error("Token refresh failed");
    };

    const waitForRefresh = async (): Promise<void> => {
      if (this.isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          this.waitQueue.push({ resolve, reject });
        });
      }
      this.isRefreshing = true;
      try {
        await doRefresh();
        this.waitQueue.forEach(({ resolve }) => resolve());
      } catch (err) {
        this.waitQueue.forEach(({ reject }) => reject(err));
        throw err;
      } finally {
        this.isRefreshing = false;
        this.waitQueue = [];
      }
    };

    const customFetch: typeof globalThis.fetch = async (input, init) => {
      const res = await fetch(input, init);
      if (res.status !== 401) return res;
      if (!refreshUrl) {
        onUnauthorized?.();
        return res;
      }
      try {
        await waitForRefresh();
      } catch {
        onUnauthorized?.();
        return res;
      }
      const retry = await fetch(input, init);
      if (retry.status === 401) onUnauthorized?.();
      return retry;
    };

    this.client = createClient<paths>({ baseUrl, credentials, fetch: customFetch });
  }

  get = <P extends PathsWith<"get">>(
    url: P,
    init?: FetchOptions<paths[P]["get"]>,
  ): Promise<UnwrapData<MethodResponse<OpenApiClient, "get", P>>> =>
    this.unwrap(this.ensure().GET(url, init as never));

  post = <P extends PathsWith<"post">>(
    url: P,
    init?: FetchOptions<paths[P]["post"]>,
  ): Promise<UnwrapData<MethodResponse<OpenApiClient, "post", P>>> =>
    this.unwrap(this.ensure().POST(url, init as never));

  put = <P extends PathsWith<"put">>(
    url: P,
    init?: FetchOptions<paths[P]["put"]>,
  ): Promise<UnwrapData<MethodResponse<OpenApiClient, "put", P>>> =>
    this.unwrap(this.ensure().PUT(url, init as never));

  patch = <P extends PathsWith<"patch">>(
    url: P,
    init?: FetchOptions<paths[P]["patch"]>,
  ): Promise<UnwrapData<MethodResponse<OpenApiClient, "patch", P>>> =>
    this.unwrap(this.ensure().PATCH(url, init as never));

  delete = <P extends PathsWith<"delete">>(
    url: P,
    init?: FetchOptions<paths[P]["delete"]>,
  ): Promise<UnwrapData<MethodResponse<OpenApiClient, "delete", P>>> =>
    this.unwrap(this.ensure().DELETE(url, init as never));

  private ensure(): OpenApiClient {
    if (!this.client) {
      throw new Error(
        "api is not configured. Call api.configure({ baseUrl }) (or configureApi) at app bootstrap.",
      );
    }
    return this.client;
  }

  private async unwrap<R>(
    promise: Promise<{ data?: unknown; error?: unknown; response: Response }>,
  ): Promise<R> {
    const { data, error, response } = await promise;

    // 413 은 스트림 단계에서 잘려 body 가 `{ code: "BAD_REQUEST" }` 거나 JSON 이 아닐 수도
    // 있다. code 만 보면 용량 초과를 놓치므로 status 로 먼저 분기한다.
    if (response.status === 413) {
      throw new ApiError("FILE_SIZE_EXCEEDED", ErrorMessage.FILE_SIZE_EXCEEDED);
    }

    if (error !== undefined) {
      if (isBeWrapper(error)) {
        throw toApiError(error.code, error.message, response.status);
      }
      throw new ApiError(
        "UNKNOWN_ERROR",
        error instanceof Error
          ? error.message
          : `Request failed with status ${response.status}`,
      );
    }

    if (data === undefined) return null as R;
    if (!isBeWrapper(data)) return data as R;

    if (data.code && data.code !== "SUCCESS") {
      throw toApiError(data.code, data.message, response.status);
    }

    const payload = data.data ?? null;
    if (Array.isArray(payload) && data.meta !== undefined) {
      return normalizeCursorListPayload(payload, data.meta) as R;
    }
    return payload as R;
  }
}

export const api = new ApiClient();

/**
 * 어플리케이션 부트스트랩 시점에 1회 호출 — `api.configure({ baseUrl, ...options })` 와 동일.
 *
 * @example
 * configureApi("/api", { onUnauthorized: () => router.navigate("/login") })
 */
export function configureApi(
  baseUrl: string,
  options?: Omit<ApiConfig, "baseUrl">,
): void {
  api.configure({ baseUrl, ...options });
}
