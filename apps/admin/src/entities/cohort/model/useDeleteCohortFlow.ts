import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { cohortKeys, useDeleteCohort } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

interface Args {
  /** 삭제 성공 후 호출 (다이얼로그 닫기 등) */
  onSuccess?: () => void
}

/**
 * cohort 삭제 흐름 훅.
 * - DELETE /admin/cohorts/:id
 * - 성공 시 cohort 캐시 무효화 + toast
 */
export const useDeleteCohortFlow = ({ onSuccess }: Args = {}) => {
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteCohort()

  const remove = async (cohort: Pick<CohortDto, "id" | "name">) => {
    try {
      await deleteMutation.mutateAsync({ params: { id: cohort.id } })
      queryClient.invalidateQueries({ queryKey: cohortKeys.all })
      toast.success(`${cohort.name}을(를) 삭제했습니다`)
      onSuccess?.()
    } catch (error) {
      toast.danger("삭제에 실패했습니다", {
        description: (error as Error)?.message,
      })
    }
  }

  return { remove, isPending: deleteMutation.isPending }
}
