import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"
import type { CreateAttendanceGenerationRequest } from "@ddd/api"

export function useCreateGenerationFlow(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.createGeneration())

  const submit = async (payload: CreateAttendanceGenerationRequest) => {
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
    }
  }

  return { submit, isPending: mutation.isPending }
}
