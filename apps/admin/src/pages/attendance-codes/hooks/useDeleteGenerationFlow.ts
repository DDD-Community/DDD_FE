import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"

interface Args {
  onSuccess?: () => void
}

export function useDeleteGenerationFlow({ onSuccess }: Args = {}) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.deleteGeneration())

  const remove = async (generationId: number) => {
    try {
      await mutation.mutateAsync({ params: { generationId } })
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      toast.success("출석 기수를 삭제했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("출석 기수 삭제에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return { remove, isPending: mutation.isPending }
}
