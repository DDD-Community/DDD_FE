import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { cohortKeys, useCreateCohort, useUpdateCohort } from "@ddd/api"

import type { SemesterRegisterForm } from "../../../pages/semesters/types"
import {
  serializeFormToCreatePayload,
  serializeFormToUpdatePayload,
} from "./serialize"

type Mode = "create" | "resume" | "edit"

interface Args {
  mode: Mode
  /** resume/edit 에서 채워짐. create 모드면 null */
  targetId: number | null
  /** 성공 시 호출 (Drawer 닫기 등) */
  onSuccess?: () => void
}

/**
 * 등록/저장 흐름 훅.
 * - mode=create   → POST /admin/cohorts
 * - mode=resume   → PATCH /admin/cohorts/:targetId
 * - mode=edit     → PATCH /admin/cohorts/:targetId
 */
export const useCreateOrUpdateCohortFlow = ({
  mode,
  targetId,
  onSuccess,
}: Args) => {
  const queryClient = useQueryClient()
  const createMutation = useCreateCohort()
  const updateMutation = useUpdateCohort()

  const isPending = createMutation.isPending || updateMutation.isPending

  const submit = async (form: SemesterRegisterForm) => {
    try {
      if (mode === "create") {
        const payload = serializeFormToCreatePayload(form)
        const created = await createMutation.mutateAsync({ payload })
        queryClient.invalidateQueries({ queryKey: cohortKeys.all })
        toast.success(`기수 ${created.name}을(를) 등록했습니다`)
      } else {
        if (targetId == null) {
          toast.danger("저장할 기수를 찾을 수 없습니다")
          return
        }
        const payload = serializeFormToUpdatePayload(form)
        await updateMutation.mutateAsync({
          params: { id: targetId },
          payload,
        })
        queryClient.invalidateQueries({ queryKey: cohortKeys.all })
        toast.success("기수 정보를 저장했습니다")
      }
      onSuccess?.()
    } catch (error) {
      const fallback =
        mode === "create" ? "기수 등록에 실패했습니다" : "저장에 실패했습니다"
      toast.danger(fallback, {
        description: (error as Error)?.message,
      })
    }
  }

  return { submit, isPending }
}
