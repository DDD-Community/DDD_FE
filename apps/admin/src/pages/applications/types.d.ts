// 임시 타입들, API 명세 보고 수정 필요

export type ApplicationPart = "pm" | "pd" | "web" | "server" | "ios" | "android"

export type ApplicationCohort = "12" | "13" | "14"

export type ApplicationStatus =
  | "doc_pending"
  | "doc_passed"
  | "doc_failed"
  | "interview_pending"
  | "interview_passed"
  | "interview_failed"
  | "active"
  | "suspended"
  | "completed"

export type ApplicationInfo = {
  id: string
  name: string
  email: string
  part: ApplicationPart
  cohort: ApplicationCohort
  semester: string
  portfolioUrl: string
  appliedAt: string
  status: ApplicationStatus
}
