import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"
import type { PostAttendanceTeamRequest } from "@ddd/api"

interface Args {
  generationId: number
  onSuccess?: () => void
}

export function useCreateTeamFlow({ generationId, onSuccess }: Args) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.createTeam())

  const submit = async (payload: PostAttendanceTeamRequest) => {
    try {
      await mutation.mutateAsync({ params: { generationId }, payload })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.teams(generationId),
        }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.generations(),
        }),
      ])
      toast.success("팀을 추가했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("팀 추가에 실패했습니다", {
        description: (error as Error).message,
      })
      throw error
    }
  }

  return { submit, isPending: mutation.isPending }
}
