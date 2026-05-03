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
    credentials = "include",
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
      throw new ApiError("UNKNOWN_ERROR", error instanceof Error ? error.message : String(error));
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
    const { responseType = "json", signal, headers: optHeaders, ...restOptions } = options ?? {};

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

export function configureApi(baseUrl: string, options?: Omit<ApiClientConfig, "baseUrl">): void {
  _apiClient = createApiClient({ baseUrl, ...options });
}
