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

export type SemesterPart = "PM" | "PD" | "Server" | "Web" | "iOS" | "Android"

export type ProcessSchedule = {
  documentAcceptStartDate: string
  documentAcceptEndDate: string
  documentResultDate: string
  interviewStartDate: string
  interviewEndDate: string
  finalResultDate: string
}

export type CurriculumWeek = {
  date: string
  description: string
}

export type SemesterRegisterForm = {
  cohortNumber: string
  status: SemesterStatus
  recruitStartDate: string
  recruitEndDate: string
  process: ProcessSchedule
  curriculum: CurriculumWeek[]
  applicationForms: Record<SemesterPart, string[]>
}
