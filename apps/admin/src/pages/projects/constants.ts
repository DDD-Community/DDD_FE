import type { ProjectStatus } from "./types"

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  in_progress: "진행 중",
  completed: "완료",
  cancelled: "취소",
}

export const STATUS_FILTER_OPTIONS = ["전체", "진행 중", "완료", "취소"]

export const STATUS_FILTER_MAP: Record<string, ProjectStatus | null> = {
  전체: null,
  "진행 중": "in_progress",
  완료: "completed",
  취소: "cancelled",
}
