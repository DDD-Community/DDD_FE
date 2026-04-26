import type { RequestHandler } from "msw"

import { semesterHandlers } from "@/pages/semesters/mockApi"
import { reminderHandlers } from "@/pages/reminders/mockApi"
import { applicationHandlers } from "@/pages/applications/mockApi"

/**
 * MSW 핸들러 목록
 *
 * 새 핸들러를 추가할 때:
 *   1. {도메인}.handlers.ts 에 핸들러 배열 작성
 *   2. 아래 handlers 배열에 ...{도메인}Handlers 추가
 */
export const handlers: RequestHandler[] = [
  ...semesterHandlers,
  ...reminderHandlers,
  ...applicationHandlers,
]
