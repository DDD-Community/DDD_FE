import type { CohortPartName, CohortStatus } from "@ddd/api"

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

/**
 * Drawer 폼 state shape.
 * cohortNumber 는 숫자만 입력 받는 가정 (직렬화 시 "기" 접미사가 자동 부착됨).
 * status 는 CohortStatus 서버 enum 값.
 * applicationForms 는 서버 파트 enum (PM/PD/BE/FE/IOS/AND) 키 사용.
 */
export type SemesterRegisterForm = {
  cohortNumber: string
  status: CohortStatus
  process: ProcessSchedule
  curriculum: CurriculumWeek[]
  applicationForms: Record<CohortPartName, string[]>
}
