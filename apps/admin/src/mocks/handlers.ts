import type { RequestHandler } from "msw"

/**
 * MSW 핸들러 목록
 *
 * 새 핸들러를 추가할 때:
 *   1. {도메인}.handlers.ts 에 핸들러 배열 작성
 *   2. 아래 handlers 배열에 ...{도메인}Handlers 추가
 *
 * 현재 등록된 핸들러: 없음 (모든 어드민 페이지가 `@ddd/api` 실 API 훅 사용).
 * MSW 인프라는 보존되며, `VITE_MSW_ENABLED=true` 환경에서만 활성화된다 (`main.tsx`).
 */
export const handlers: RequestHandler[] = []
