import { getApiClient, type ApiRequestOptions } from "./client";

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export interface OrvalRequestConfig {
  url: string;
  method: HttpMethod;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  responseType?: "json" | "blob" | "text";
  signal?: AbortSignal;
}

function buildPath(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

export const apiFetch = <T>(config: OrvalRequestConfig): Promise<T> => {
  const client = getApiClient();
  const path = buildPath(config.url, config.params);
  const options: ApiRequestOptions = {
    headers: config.headers,
    responseType: config.responseType,
    signal: config.signal,
  };

  switch (config.method.toLowerCase() as Lowercase<HttpMethod>) {
    case "get":
      return client.get<T>(path, options);
    case "delete":
      return client.delete<T>(path, options);
    case "post":
      return client.post<T>(path, config.data, options);
    case "put":
      return client.put<T>(path, config.data, options);
    case "patch":
      return client.patch<T>(path, config.data, options);
  }
};
