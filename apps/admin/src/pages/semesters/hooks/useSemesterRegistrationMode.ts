import { useMemo } from "react"

import { useCohorts } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

import {
  isCohortComplete,
  serializeCohortToForm,
} from "../../../entities/cohort"

import type { SemesterRegisterForm } from "../types"

export type RegistrationMode = "create" | "resume"

export interface RegistrationState {
  mode: RegistrationMode
  /** resume 모드에서만 채워짐 */
  targetId: number | null
  /** resume 모드에서만 채워짐 — Drawer 가 prefill 에 사용 */
  prefill: SemesterRegisterForm | undefined
  /** TitleSection 의 버튼 라벨 */
  buttonLabel: string
}

/**
 * id 내림차순으로 가장 최신 cohort 의 완성도를 보고 등록 모드를 결정한다.
 * - cohort 없음 → create
 * - 최신 cohort 가 모두 채워짐 → create
 * - 최신 cohort 가 미완성 → resume (해당 cohort id + 현재 값으로 prefill)
 *
 * edit 모드는 페이지의 행 "수정" 클릭이 별도로 트리거하므로 여기서 다루지 않는다.
 */
export const useSemesterRegistrationMode = (): RegistrationState => {
  const { data } = useCohorts()
  const cohorts: CohortDto[] = useMemo(() => data ?? [], [data])

  return useMemo(() => {
    const sortedDesc = cohorts.slice().sort((a, b) => b.id - a.id)
    const latest = sortedDesc[0]

    if (!latest || isCohortComplete(latest)) {
      return {
        mode: "create",
        targetId: null,
        prefill: undefined,
        buttonLabel: "새 기수 등록",
      }
    }

    return {
      mode: "resume",
      targetId: latest.id,
      prefill: serializeCohortToForm(latest),
      buttonLabel: "기수 등록 마저하기",
    }
  }, [cohorts])
}
