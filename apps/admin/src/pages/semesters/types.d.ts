import type {
  ApplicationQuestionType,
  CohortPartName,
  CohortStatus,
} from "@ddd/api"

export type ProcessSchedule = {
  documentResultDate: string
  interviewStartDate: string
  interviewEndDate: string
  finalResultDate: string
}

export type CurriculumWeek = {
  date: string
  description: string
  time: string
}

export type CohortPartQuestion = {
  key: string
  label: string
  required: boolean
  /** "text" = 서술형, "file" = PDF 첨부. 저장된 질문에 없으면 "text" 로 복원한다. */
  type: ApplicationQuestionType
}

export type CohortPartFormState = {
  isOpen: boolean
  questions: CohortPartQuestion[]
}

export type SemesterRegisterForm = {
  cohortNumber: string
  status: CohortStatus
  recruitStartDate: string
  recruitEndDate: string
  process: ProcessSchedule
  curriculum: CurriculumWeek[]
  parts: Record<CohortPartName, CohortPartFormState>
}
