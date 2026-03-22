import { ApiError, type ErrorMessageKey } from "./errors";
import type { ApiResponse } from "./types";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  throw new Error("API URL is not defined");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  /**
   * 기본값은 application/json, 필요에 따라 다른 헤더 추가 가능 및, Content-Type 변경 가능하도록 구현
   */
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${getBaseUrl()}${path}`, {
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
    throw new ApiError(body.code as ErrorMessageKey, body.message);
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "POST", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
};
