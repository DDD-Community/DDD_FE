import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  throw new Error("API URL is not defined");
}

// URL 생성 로직을 별도 함수로 분리, '/' 신경쓰지않아도 되도록 수정
function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return new URL(path, baseUrl).toString();
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  /**
   * 기본값은 application/json, 필요에 따라 다른 헤더 추가 가능 및, Content-Type 변경 가능하도록 구현
   */
  const method = (init?.method || "GET").toUpperCase();
  const hasRequestBody = init?.body !== undefined && init?.body !== null;
  const methodCanHaveBody = ["POST", "PATCH", "PUT"].includes(method);
  const headers = new Headers(init?.headers);

  // FormData인 경우 Content-Type을 자동으로 설정,
  // 그렇지 않은 경우, body를 가질 수 있는 메서드이거나 body가 존재하는 경우 application/json으로 설정
  if (
    !headers.has("Content-Type") &&
    !(init?.body instanceof FormData) &&
    (methodCanHaveBody || hasRequestBody)
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const contentType = res.headers.get("Content-Type") || "";
  const isJsonResponse = contentType.includes("application/json");

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    if (!res.ok) {
      throw new ApiError(
        "UNKNOWN_ERROR",
        "No content returned from the server.",
      );
    }
    return null as T;
  }

  let body: ApiResponse<T>;

  if (isJsonResponse) {
    try {
      body = (await res.json()) as ApiResponse<T>;
    } catch (error) {
      throw new ApiError("UNKNOWN_ERROR", "Failed to parse JSON response.");
    }
  } else {
    const text = await res.text().catch(() => "");
    const message = text || "Unexpected response format from the server.";
    throw new ApiError("UNKNOWN_ERROR", message);
  }

  if (body.code !== "SUCCESS") {
    throw new ApiError(body.code || "UNKNOWN_ERROR", body.message);
  }

  return body.data as T;
}

// JSON일 때만 stringify하고, 나머지는 그대로 보내도록 구현
function resolveBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
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

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),

  post: <T>(
    path: string,
    body: BodyInit | FormData | string | null,
    init?: RequestInit,
  ) => apiFetch<T>(path, { ...init, method: "POST", body: resolveBody(body) }),

  patch: <T>(
    path: string,
    body: BodyInit | FormData | string | null,
    init?: RequestInit,
  ) => apiFetch<T>(path, { ...init, method: "PATCH", body: resolveBody(body) }),

  delete: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
};
