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

/**
 * 지원자 안내 메일에 들어가는 기수별 값. BE 는 process jsonb 의 같은 이름 키로 읽는다.
 * 폼에서는 모두 문자열로 다루고, 저장할 때 lib/announcement.ts 가 숫자·null 로 바꾼다.
 */
export type AnnouncementInfo = {
  /** 면접 일정 확정 메일: 면접 예상 소요 시간(분). 비우면 슬롯 길이로 안내한다 */
  interviewDurationMinutes: string
  /** 면접 일정 확정 메일: 일정 조정 회신 기한 */
  interviewRescheduleDeadline: string
  /** 최종 합격 메일: 참가비(원) */
  participationFee: string
  /** 최종 합격 메일: 참가비 구성 (예: 운영비 8만원 + 노쇼비 8만원) */
  participationFeeDetail: string
  /** 최종 합격 메일: 입금 계좌 (은행명 계좌번호) */
  bankAccount: string
  /** 최종 합격 메일: 예금주 */
  accountHolder: string
  /** 최종 합격 메일: 입금 기한 */
  participationConfirmDeadline: string
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
  announcement: AnnouncementInfo
  curriculum: CurriculumWeek[]
  parts: Record<CohortPartName, CohortPartFormState>
}
