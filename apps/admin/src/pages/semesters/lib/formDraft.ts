import { z } from "zod"

import {
  APPLICATION_QUESTION_TYPES,
  CreateCohortRequestDtoStatus,
  type CohortPartName,
} from "@ddd/api"

import {
  DEFAULT_ATTENDANCE_START_TIME,
  SEMESTER_PARTS,
} from "@/pages/semesters/constants"
import { EMPTY_ANNOUNCEMENT } from "@/pages/semesters/lib/announcement"

import type { AnnouncementInfo, SemesterRegisterForm } from "../types"

/**
 * 기수 등록/수정 폼 임시 저장 (sessionStorage).
 *
 * 저장이 실패하거나(파트 양식 저장 실패 등) 새로고침이 나도 입력값을 잃지 않게 한다.
 * 탭 단위로만 살아있으면 충분하므로 localStorage 가 아닌 sessionStorage 를 쓴다.
 */
const KEY_PREFIX = "ddd-admin:semester-form-draft"

/**
 * 편집 대상별로 draft 를 분리한다 (신규 등록은 "new").
 * 분리하지 않으면 신규 등록 중이던 입력이 기존 기수 수정 화면에 새어나온다.
 */
export const draftKeyOf = (targetId: number | null): string =>
  `${KEY_PREFIX}:${targetId ?? "new"}`

const questionSchema = z.object({
  key: z.string(),
  label: z.string(),
  required: z.boolean(),
  // type 도입 전에 저장된 draft 에는 없다. 통째로 버리지 않고 서술형으로 복원한다.
  type: z.enum(APPLICATION_QUESTION_TYPES).default("text"),
})

const partSchema = z.object({
  isOpen: z.boolean(),
  questions: z.array(questionSchema),
})

// SEMESTER_PARTS 를 그대로 써서 파트가 추가되면 스키마도 함께 따라가게 한다.
const partsSchema = z.object(
  Object.fromEntries(SEMESTER_PARTS.map((part) => [part, partSchema])) as Record<
    CohortPartName,
    typeof partSchema
  >,
)

const draftSchema = z.object({
  cohortNumber: z.string(),
  status: z.nativeEnum(CreateCohortRequestDtoStatus),
  recruitStartDate: z.string(),
  recruitEndDate: z.string(),
  process: z.object({
    documentResultDate: z.string(),
    interviewStartDate: z.string(),
    interviewEndDate: z.string(),
    finalResultDate: z.string(),
  }),
  // 안내 메일 칸 도입 전에 만든 초안에는 없다. 통째로 버리지 않고 readFormDraft 가 채운다.
  announcement: z
    .object({
      interviewDurationMinutes: z.string(),
      interviewRescheduleDeadline: z.string(),
      participationFee: z.string(),
      participationFeeDetail: z.string(),
      bankAccount: z.string(),
      accountHolder: z.string(),
      participationConfirmDeadline: z.string(),
    })
    .optional(),
  curriculum: z.array(
    z.object({
      date: z.string(),
      description: z.string(),
      // 시각 기능 이전에 만든 초안(필드 없음)이나 비어 있는 시각은 기본값으로 복원한다.
      // 빈 값으로 복원되면 저장 시 출석앱 동기화가 "시각 있는 주차 0개"로 건너뛴다.
      time: z
        .string()
        .optional()
        .transform((value) => value || DEFAULT_ATTENDANCE_START_TIME),
    })
  ),
  parts: partsSchema,
})

/**
 * 저장된 draft 를 읽는다. 없거나 형식이 맞지 않으면 null.
 *
 * 안내 메일 칸이 없는 옛 draft 는 announcementFallback(서버 값)으로 채운다. 빈 칸으로 두면
 * 저장할 때 null 이 나가 서버의 참가비·계좌 값이 지워진다.
 * 스토리지 값은 신뢰할 수 없으므로(폼 구조 변경·수동 조작) 반드시 검증하고,
 * 깨진 값은 그 자리에서 버려 다음 열람 때 반복 실패하지 않게 한다.
 */
export const readFormDraft = (
  key: string,
  announcementFallback: AnnouncementInfo = EMPTY_ANNOUNCEMENT,
): SemesterRegisterForm | null => {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const parsed = draftSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      sessionStorage.removeItem(key)
      return null
    }
    return {
      ...parsed.data,
      announcement: parsed.data.announcement ?? { ...announcementFallback },
    }
  } catch {
    // JSON 파싱 실패 / 스토리지 접근 불가(프라이빗 모드 등) — draft 없음으로 취급
    return null
  }
}

export const saveFormDraft = (
  key: string,
  values: SemesterRegisterForm,
): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(values))
  } catch {
    // 용량 초과·접근 불가. 임시 저장 실패가 입력을 막아서는 안 되므로 무시한다.
  }
}

export const clearFormDraft = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // noop — 위와 동일
  }
}
