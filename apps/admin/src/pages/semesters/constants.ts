import type { CohortStatus } from "@ddd/api"

import type { SemesterPart } from "./types"

export const STATUS_LABEL: Record<CohortStatus, string> = {
  UPCOMING: "모집 예정",
  RECRUITING: "모집중",
  ACTIVE: "활동중",
  CLOSED: "활동종료",
}

export const STATUS_FILTER_OPTIONS = [
  "전체",
  "활동중",
  "활동종료",
  "모집 예정",
  "모집중",
] as const

export type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number]

export const STATUS_FILTER_MAP: Record<StatusFilterOption, CohortStatus | null> = {
  전체: null,
  "모집 예정": "UPCOMING",
  모집중: "RECRUITING",
  활동중: "ACTIVE",
  활동종료: "CLOSED",
}

export const STATUS_OPTIONS: Array<{ label: string; value: CohortStatus }> = [
  { label: "모집 예정", value: "UPCOMING" },
  { label: "모집 중", value: "RECRUITING" },
  { label: "활동 중", value: "ACTIVE" },
  { label: "활동 종료", value: "CLOSED" },
]

export const SEMESTER_PARTS: SemesterPart[] = [
  "PM",
  "PD",
  "Server",
  "Web",
  "iOS",
  "Android",
]

export const CURRICULUM_WEEK_COUNT = 9
