import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"

interface Args {
  generationId: number
  onSuccess?: () => void
}

export function useDeleteTeamFlow({ generationId, onSuccess }: Args) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.deleteTeam())

  const remove = async (teamId: number) => {
    try {
      await mutation.mutateAsync({ params: { teamId } })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.teams(generationId),
        }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.generations(),
        }),
      ])
      toast.success("팀을 삭제했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("팀 삭제에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return { remove, isPending: mutation.isPending }
}
