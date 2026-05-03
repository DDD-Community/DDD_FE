import { CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortStatus } from "@ddd/api"

/** status 필터 값 — "ALL" 은 전체 표시 */
export type StatusFilterValue = CohortStatus | "ALL"

export const STATUS_FILTER_OPTIONS: Array<{
  value: StatusFilterValue
  label: string
}> = [
  { value: "ALL", label: "전체" },
  { value: CreateCohortRequestDtoStatus.UPCOMING, label: "모집 예정" },
  { value: CreateCohortRequestDtoStatus.RECRUITING, label: "모집중" },
  { value: CreateCohortRequestDtoStatus.ACTIVE, label: "활동중" },
  { value: CreateCohortRequestDtoStatus.CLOSED, label: "활동 종료" },
]

/** Drawer 의 status 셀렉트 옵션 (필터 옵션과 달리 "ALL" 미포함) */
export const STATUS_OPTIONS: Array<{ label: string; value: CohortStatus }> = [
  { label: "모집 예정", value: CreateCohortRequestDtoStatus.UPCOMING },
  { label: "모집 중", value: CreateCohortRequestDtoStatus.RECRUITING },
  { label: "활동 중", value: CreateCohortRequestDtoStatus.ACTIVE },
  { label: "활동 종료", value: CreateCohortRequestDtoStatus.CLOSED },
]

export const CURRICULUM_WEEK_COUNT = 9
