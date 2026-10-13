import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"
import type { PostAttendanceGenerationRequest } from "@ddd/api"

export function useCreateGenerationFlow(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.createGeneration())

  const submit = async (payload: PostAttendanceGenerationRequest) => {
    try {
      await mutation.mutateAsync({ payload })
      await queryClient.invalidateQueries({
        queryKey: attendanceKeys.generations(),
      })
      toast.success("출석 기수를 추가했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("출석 기수 추가에 실패했습니다", {
        description: (error as Error).message,
      })
      throw error
    }
  }

  return { submit, isPending: mutation.isPending }
}
