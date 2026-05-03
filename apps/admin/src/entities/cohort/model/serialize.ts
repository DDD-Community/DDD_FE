import { CohortPartConfigDtoName } from "@ddd/api"

import type {
  CohortDto,
  CohortPartName,
  CreateCohortRequestDto,
  UpdateCohortRequestDto,
} from "@ddd/api"

import type { SemesterRegisterForm } from "../../../pages/semesters/types"

const PARTS: CohortPartName[] = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
]

/** form.cohortNumber("16") → DTO.name("16기"). cohort.name 가 "기" 로 끝나면 그대로 둔다 */
const buildName = (cohortNumber: string): string => {
  const trimmed = cohortNumber.trim()
  if (!trimmed) return ""
  return trimmed.endsWith("기") ? trimmed : `${trimmed}기`
}

const stripSuffix = (name: string): string =>
  name.endsWith("기") ? name.slice(0, -1) : name

/** 빈 폼 (Task 15 의 SemesterRegisterDrawer 가 사용하는 createInitialForm 과 동일 모양) */
const emptyForm = (): SemesterRegisterForm => ({
  cohortNumber: "",
  status: CohortPartConfigDtoName.PM // placeholder; 다음 줄에서 덮어씀
    ? "UPCOMING"
    : "UPCOMING",
  recruitStartDate: "",
  recruitEndDate: "",
  process: {
    documentAcceptStartDate: "",
    documentAcceptEndDate: "",
    documentResultDate: "",
    interviewStartDate: "",
    interviewEndDate: "",
    finalResultDate: "",
  },
  curriculum: Array.from({ length: 9 }, () => ({ date: "", description: "" })),
  applicationForms: {
    [CohortPartConfigDtoName.PM]: [""],
    [CohortPartConfigDtoName.PD]: [""],
    [CohortPartConfigDtoName.BE]: [""],
    [CohortPartConfigDtoName.FE]: [""],
    [CohortPartConfigDtoName.IOS]: [""],
    [CohortPartConfigDtoName.AND]: [""],
  } as SemesterRegisterForm["applicationForms"],
})

/** 폼 → CreateCohortRequestDto */
export const serializeFormToCreatePayload = (
  form: SemesterRegisterForm,
): CreateCohortRequestDto => ({
  name: buildName(form.cohortNumber),
  recruitStartAt: form.recruitStartDate,
  recruitEndAt: form.recruitEndDate,
  status: form.status,
  process: { ...form.process },
  curriculum: form.curriculum.map((w) => ({ ...w })),
  applicationForm: { ...form.applicationForms } as Record<string, unknown>,
  // parts 는 이번 스코프에서 omit
})

/**
 * 폼 → UpdateCohortRequestDto.
 * dirty 추적 없이 모든 필드를 보낸다 (PATCH 옵셔널이라 안전, 단순함 우선).
 */
export const serializeFormToUpdatePayload = (
  form: SemesterRegisterForm,
): UpdateCohortRequestDto => ({
  name: buildName(form.cohortNumber),
  recruitStartAt: form.recruitStartDate,
  recruitEndAt: form.recruitEndDate,
  status: form.status,
  process: { ...form.process },
  curriculum: form.curriculum.map((w) => ({ ...w })),
  applicationForm: { ...form.applicationForms } as Record<string, unknown>,
})

/** CohortDto → SemesterRegisterForm. 잘못된 shape 은 빈 폼으로 폴백 */
export const serializeCohortToForm = (
  cohort: CohortDto,
): SemesterRegisterForm => {
  const base = emptyForm()
  return {
    cohortNumber: stripSuffix(cohort.name ?? ""),
    status: cohort.status,
    recruitStartDate: cohort.recruitStartAt ?? "",
    recruitEndDate: cohort.recruitEndAt ?? "",
    process: extractProcess(cohort.process) ?? base.process,
    curriculum: extractCurriculum(cohort.curriculum) ?? base.curriculum,
    applicationForms:
      extractApplicationForms(cohort.applicationForm) ?? base.applicationForms,
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0

const extractProcess = (
  raw: unknown,
): SemesterRegisterForm["process"] | null => {
  if (typeof raw !== "object" || raw === null) return null
  const o = raw as Record<string, unknown>
  return {
    documentAcceptStartDate: isNonEmptyString(o.documentAcceptStartDate)
      ? o.documentAcceptStartDate
      : "",
    documentAcceptEndDate: isNonEmptyString(o.documentAcceptEndDate)
      ? o.documentAcceptEndDate
      : "",
    documentResultDate: isNonEmptyString(o.documentResultDate)
      ? o.documentResultDate
      : "",
    interviewStartDate: isNonEmptyString(o.interviewStartDate)
      ? o.interviewStartDate
      : "",
    interviewEndDate: isNonEmptyString(o.interviewEndDate)
      ? o.interviewEndDate
      : "",
    finalResultDate: isNonEmptyString(o.finalResultDate)
      ? o.finalResultDate
      : "",
  }
}

const extractCurriculum = (
  raw: unknown,
): SemesterRegisterForm["curriculum"] | null => {
  if (!Array.isArray(raw)) return null
  const padded = Array.from({ length: 9 }, (_, i) => {
    const w = raw[i]
    if (typeof w !== "object" || w === null) return { date: "", description: "" }
    const o = w as Record<string, unknown>
    return {
      date: isNonEmptyString(o.date) ? o.date : "",
      description: isNonEmptyString(o.description) ? o.description : "",
    }
  })
  return padded
}

const extractApplicationForms = (
  raw: unknown,
): SemesterRegisterForm["applicationForms"] | null => {
  if (typeof raw !== "object" || raw === null) return null
  const o = raw as Record<string, unknown>
  const result = {} as SemesterRegisterForm["applicationForms"]
  for (const part of PARTS) {
    const list = o[part]
    if (Array.isArray(list)) {
      const filtered = list.filter((q): q is string => typeof q === "string")
      result[part] = filtered.length > 0 ? filtered : [""]
    } else {
      result[part] = [""]
    }
  }
  return result
}
