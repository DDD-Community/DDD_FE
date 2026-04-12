import type { ReminderRole, ReminderStatus } from "./types"

export const ROLE_LABEL: Record<ReminderRole, string> = {
  developer: "개발자",
  designer: "디자이너",
  planner: "기획자",
}

export const STATUS_LABEL: Record<ReminderStatus, string> = {
  pending: "대기",
  notified: "발송 완료",
}

export const STATUS_FILTER_OPTIONS = ["전체", "대기", "발송 완료"]

export const STATUS_FILTER_MAP: Record<string, ReminderStatus | null> = {
  전체: null,
  대기: "pending",
  "발송 완료": "notified",
}
