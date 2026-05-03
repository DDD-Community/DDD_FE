// Drawer 전용 폼 상태 타입.
// (목록·필터·테이블은 `@ddd/api` `CohortDto` / `CohortStatus` 를 직접 사용한다.)
//
// TODO: SemesterRegisterDrawer 가 useCreateCohort 로 연동되는 시점에
//       파트명 매핑(Server↔BE / Web↔FE / Android↔AND) 과 함께 폼 타입 자체를
//       `CreateCohortRequestDto` 기반으로 재정렬한다.

import type { CohortStatus } from "@ddd/api"

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
  status: CohortStatus
  recruitStartDate: string
  recruitEndDate: string
  process: ProcessSchedule
  curriculum: CurriculumWeek[]
  applicationForms: Record<SemesterPart, string[]>
}
