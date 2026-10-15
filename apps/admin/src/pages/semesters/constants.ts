import { CohortPartConfigDtoName, CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortPartName, CohortStatus } from "@ddd/api"

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

export const CURRICULUM_WEEK_COUNT = 9

/**
 * 서버 파트 enum → 사용자 표시 라벨.
 * 서버 enum 을 단일 진실 출처로 두고, UI 에 노출되는 한글 라벨만 여기에 유지한다.
 */
export const PART_LABEL: Record<CohortPartName, string> = {
  [CohortPartConfigDtoName.PM]: "PM",
  [CohortPartConfigDtoName.PD]: "PD",
  [CohortPartConfigDtoName.BE]: "백엔드",
  [CohortPartConfigDtoName.FE]: "프론트엔드",
  [CohortPartConfigDtoName.IOS]: "iOS",
  [CohortPartConfigDtoName.AND]: "Android",
}

/** Drawer 의 파트 탭 순서 (서버 enum 그대로) */
export const SEMESTER_PARTS: CohortPartName[] = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
]

/** 커리큘럼 주차의 출석 시작 시각 기본값. DDD 세션은 14시에 시작한다. 주차별로 바꿀 수 있다. */
export const DEFAULT_ATTENDANCE_START_TIME = "14:00"
