import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, cohortKeys, cohortMutations } from "@ddd/api"
import { toast } from "@heroui/react"

import type { CohortDto } from "@ddd/api"

import type { SemesterRegisterForm } from "../types"
import {
  buildName,
  serializeFormToCreatePayload,
  serializeFormToPartsPayload,
  serializeFormToUpdatePayload,
} from "../lib/serialize"
import { describeAttendanceSync } from "../lib/attendanceSyncMessage"

export class PartsSaveAfterCreateError extends Error {
  readonly name = "PartsSaveAfterCreateError"
  readonly newCohortId: number
  constructor(newCohortId: number, cause: unknown) {
    super("Cohort created but parts save failed", { cause })
    this.newCohortId = newCohortId
  }
}

type Mode = "create" | "resume" | "edit"

interface Args {
  mode: Mode
  /** resume/edit 에서 채워짐. create 모드면 null */
  targetId: number | null
}

interface SubmitResult {
  cohortId: number
  name: string
  createdInThisCall: boolean
}

export const useCreateOrUpdateCohortFlow = ({ mode, targetId }: Args) => {
  const queryClient = useQueryClient()
  const createMutation = useMutation(cohortMutations.createCohort())
  const updateMutation = useMutation(cohortMutations.updateCohort())
  const updatePartsMutation = useMutation(cohortMutations.updateCohortParts())

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updatePartsMutation.isPending

  const submit = async (form: SemesterRegisterForm): Promise<SubmitResult> => {
    let cohortId = targetId
    let createdInThisCall = false
    let attendanceSync: CohortDto["attendanceSync"] = null
    // 이름은 BE 응답이 아니라 폼에서 도출한다 — 구버전 BE 는 PATCH 응답 data 가 null 이라
    // 결과의 필드를 바로 읽으면 크래시한다. attendanceSync 도 같은 이유로 null 안전하게 읽는다.
    const name = buildName(form.cohortNumber)

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync({
          payload: serializeFormToCreatePayload(form),
        })
        // 생성은 새 id 가 반드시 필요하다 (파트 저장 대상). 없으면 진행 불가.
        if (created?.id == null) {
          throw new Error("기수 생성 응답이 비어 있습니다")
        }
        cohortId = created.id
        attendanceSync = created?.attendanceSync ?? null
        createdInThisCall = true
      } else {
        if (cohortId == null) throw new Error("저장할 기수를 찾을 수 없습니다")
        const updated = await updateMutation.mutateAsync({
          params: { id: cohortId },
          payload: serializeFormToUpdatePayload(form),
        })
        attendanceSync = updated?.attendanceSync ?? null
      }

      try {
        await updatePartsMutation.mutateAsync({
          params: { id: cohortId! },
          payload: serializeFormToPartsPayload(form),
        })
      } catch (partsError) {
        if (createdInThisCall) {
          throw new PartsSaveAfterCreateError(cohortId!, partsError)
        }
        throw partsError
      }

      const syncMessage = describeAttendanceSync(attendanceSync)
      if (syncMessage.tone === "success") {
        toast.success(syncMessage.title, {
          description: syncMessage.description,
        })
      } else if (syncMessage.tone === "warning") {
        toast.warning(syncMessage.title, {
          description: syncMessage.description,
        })
      }
      return { cohortId: cohortId!, name, createdInThisCall }
    } finally {
      queryClient.invalidateQueries({ queryKey: cohortKeys.all })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    }
  }

  return { submit, isPending }
}
