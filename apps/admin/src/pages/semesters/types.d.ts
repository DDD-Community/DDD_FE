// 임시 타입들, API 명세 보고 수정 필요

export type SemesterStatus = "active" | "inactive" | "upcoming" | "recruiting"
export type SemesterInfo = {
  semester: string
  status: SemesterStatus
  recruitmentPeriod: string
  applicants: number
  members: number
  createdAt: string
}
