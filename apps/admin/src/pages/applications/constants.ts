import type {
  ApplicationCohort,
  ApplicationPart,
  ApplicationStatus,
} from "./types"

export const PART_LABEL: Record<ApplicationPart, string> = {
  pm: "PM",
  pd: "PD",
  web: "Web",
  server: "Server",
  ios: "iOS",
  android: "Android",
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  doc_pending: "서류대기",
  doc_passed: "서류합격",
  doc_failed: "서류불합격",
  interview_pending: "면접대기",
  interview_passed: "면접합격",
  interview_failed: "면접불합격",
  active: "활동중",
  suspended: "활동중단",
  completed: "활동종료",
}

export const COHORT_FILTER_OPTIONS = [
  "전체 기수",
  "12기",
  "13기",
  "14기",
] as const

export const PART_FILTER_OPTIONS = [
  "전체 파트",
  "PM",
  "PD",
  "Web",
  "Server",
  "iOS",
  "Android",
] as const

export const STATUS_FILTER_OPTIONS = [
  "전체 상태",
  "서류대기",
  "서류합격",
  "서류불합격",
  "면접대기",
  "면접합격",
  "면접불합격",
  "활동중",
  "활동중단",
  "활동종료",
] as const

export const COHORT_FILTER_MAP: Record<string, ApplicationCohort | null> = {
  "전체 기수": null,
  "12기": "12",
  "13기": "13",
  "14기": "14",
}

export const PART_FILTER_MAP: Record<string, ApplicationPart | null> = {
  "전체 파트": null,
  PM: "pm",
  PD: "pd",
  Web: "web",
  Server: "server",
  iOS: "ios",
  Android: "android",
}

export const STATUS_FILTER_MAP: Record<string, ApplicationStatus | null> = {
  "전체 상태": null,
  서류대기: "doc_pending",
  서류합격: "doc_passed",
  서류불합격: "doc_failed",
  면접대기: "interview_pending",
  면접합격: "interview_passed",
  면접불합격: "interview_failed",
  활동중: "active",
  활동중단: "suspended",
  활동종료: "completed",
}
