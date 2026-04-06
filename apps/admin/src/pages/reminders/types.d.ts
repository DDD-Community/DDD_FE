// 임시 타입들, API 명세 보고 수정 필요

export type ReminderRole = "developer" | "designer" | "planner"
export type ReminderStatus = "pending" | "notified" 

export type ReminderInfo = {
  id: string
  name: string
  email: string
  role: ReminderRole
  semester: string
  appliedAt: string
  status: ReminderStatus
}
