import { configureApi } from "@ddd/api";

/**
 * @ddd/api 의 ApiClient 를 매 호출 시점에 1회 configure 한다.
 *
 * Next.js Server Component / Client Component 양쪽에서 모듈이 캐시되므로
 * 사실상 idempotent 하다. 부트스트랩 1회 호출로 치환하는 작업은 별도 PR.
 */
export function ensureApiConfigured(): void {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined);
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }
  // 지원자 세션(이메일 인증 쿠키)에는 refresh 계약이 없다. 기본값대로 두면 401 마다
  // /auth/refresh 를 찔러보고 원 요청까지 재시도해 실패가 3배로 늘어난다.
  configureApi(baseUrl, { refreshTokenPath: null });
}
