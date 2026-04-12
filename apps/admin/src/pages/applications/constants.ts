import type { ApplicationRole, ApplicationStatus } from "./types"

export const ROLE_LABEL: Record<ApplicationRole, string> = {
  developer: "개발자",
  designer: "디자이너",
  planner: "기획자",
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "검토 중",
  passed: "합격",
  failed: "불합격",
  cancelled: "취소",
}

export const STATUS_FILTER_OPTIONS = ["전체", "검토 중", "합격", "불합격", "취소"]

export const STATUS_FILTER_MAP: Record<string, ApplicationStatus | null> = {
  전체: null,
  "검토 중": "pending",
  합격: "passed",
  불합격: "failed",
  취소: "cancelled",
}
