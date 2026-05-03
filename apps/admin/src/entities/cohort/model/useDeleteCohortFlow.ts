import { useState } from "react"

import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { applicationKeys, cohortKeys, useDeleteCohort } from "@ddd/api"

interface Args {
  /** 삭제 대상 cohort id. resume 모드에서만 채워짐 */
  targetId: number | null
  /** 삭제 성공 시 호출 (Drawer 닫기 + form 초기화) */
  onDeleted?: () => void
}

/**
 * 삭제 확인 다이얼로그 + DELETE 호출 + 캐시 무효화 + toast 를 묶은 훅.
 *
 * UI 측은 다음을 받아 사용한다:
 * - isConfirmOpen: AlertDialog 의 isOpen
 * - openConfirm: 삭제 버튼이 호출 (다이얼로그 열기)
 * - closeConfirm: 다이얼로그 onOpenChange(false) 핸들러
 * - confirm: 다이얼로그의 "삭제" 버튼이 호출 (실제 mutate)
 */
export const useDeleteCohortFlow = ({ targetId, onDeleted }: Args) => {
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteCohort()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = () => {
    if (targetId == null) {
      toast.danger("삭제할 기수를 찾을 수 없습니다")
      return
    }
    setIsConfirmOpen(true)
  }

  const closeConfirm = () => setIsConfirmOpen(false)

  const confirm = async () => {
    if (targetId == null) return
    try {
      await deleteMutation.mutateAsync({ params: { id: targetId } })
      queryClient.invalidateQueries({ queryKey: cohortKeys.all })
      queryClient.invalidateQueries({
        queryKey: applicationKeys.adminList({ cohortId: targetId }),
      })
      toast.success("기수를 삭제했습니다")
      setIsConfirmOpen(false)
      onDeleted?.()
    } catch (error) {
      toast.danger("삭제에 실패했습니다", {
        description: (error as Error)?.message,
      })
    }
  }

  return {
    isConfirmOpen,
    openConfirm,
    closeConfirm,
    confirm,
    isPending: deleteMutation.isPending,
  }
}
