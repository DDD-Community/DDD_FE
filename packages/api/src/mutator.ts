import { apiFetch } from "./client";

export interface MutatorOptions<TData = unknown> {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: TData;
  signal?: AbortSignal;
}

export const mutator = <T>({ url, method, headers, data, signal }: MutatorOptions): Promise<T> => {
  const body = data !== undefined ? JSON.stringify(data) : undefined;
  return apiFetch<T>(url, { method, headers, body, signal });
};
