import type { SemesterPart, SemesterStatus } from "./types"

export const STATUS_LABEL: Record<SemesterStatus, string> = {
  active: "활동중",
  inactive: "활동종료",
  upcoming: "모집 예정",
  recruiting: "모집중",
}

export const STATUS_FILTER_OPTIONS = [
  "전체",
  "활동중",
  "활동종료",
  "모집 예정",
  "모집중",
]

export const STATUS_FILTER_MAP: Record<string, SemesterStatus | null> = {
  전체: null,
  "모집 예정": "upcoming",
  모집중: "recruiting",
  활동중: "active",
  활동종료: "inactive",
}

export const STATUS_OPTIONS: Array<{ label: string; value: SemesterStatus }> = [
  { label: "모집 예정", value: "upcoming" },
  { label: "모집 중", value: "recruiting" },
  { label: "활동 중", value: "active" },
  { label: "활동 종료", value: "inactive" },
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
