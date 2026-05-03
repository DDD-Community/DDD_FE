import { CohortPartConfigDtoName } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0

const PROCESS_KEYS = [
  "documentAcceptStartDate",
  "documentAcceptEndDate",
  "documentResultDate",
  "interviewStartDate",
  "interviewEndDate",
  "finalResultDate",
] as const

const PARTS = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
] as const

/** process: 6개 키 모두 비어있지 않은 string 이어야 완료 */
export const isProcessComplete = (process: unknown): boolean => {
  if (typeof process !== "object" || process === null) return false
  const obj = process as Record<string, unknown>
  return PROCESS_KEYS.every((k) => isNonEmptyString(obj[k]))
}

/** curriculum: 길이 9 배열 + 모든 항목이 { date, description } 둘 다 비어있지 않음 */
export const isCurriculumComplete = (curriculum: unknown): boolean => {
  if (!Array.isArray(curriculum)) return false
  if (curriculum.length !== 9) return false
  return curriculum.every((week) => {
    if (typeof week !== "object" || week === null) return false
    const w = week as Record<string, unknown>
    return isNonEmptyString(w.date) && isNonEmptyString(w.description)
  })
}

/**
 * applicationForm: 6개 파트(PM/PD/BE/FE/IOS/AND) 모두 string[] 이며
 * 각 배열에 비어있지 않은 질문이 1개 이상.
 */
export const isApplicationFormComplete = (af: unknown): boolean => {
  if (typeof af !== "object" || af === null) return false
  const obj = af as Record<string, unknown>
  return PARTS.every((part) => {
    const list = obj[part]
    if (!Array.isArray(list)) return false
    return list.some((q) => isNonEmptyString(q))
  })
}

/** 위 3개 모두 완료여야 cohort 가 완료된 것으로 간주 (= "새 기수 등록" 모드) */
export const isCohortComplete = (cohort: CohortDto): boolean =>
  isProcessComplete(cohort.process) &&
  isCurriculumComplete(cohort.curriculum) &&
  isApplicationFormComplete(cohort.applicationForm)
