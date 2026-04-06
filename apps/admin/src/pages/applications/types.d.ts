// 임시 타입들, API 명세 보고 수정 필요

export type ApplicationRole = "developer" | "designer" | "planner"
export type ApplicationStatus = "pending" | "passed" | "failed" | "cancelled"

export type ApplicationInfo = {
  id: string
  name: string
  email: string
  role: ApplicationRole
  semester: string
  portfolioUrl: string
  appliedAt: string
  status: ApplicationStatus
}
