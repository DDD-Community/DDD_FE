import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"

interface Args {
  generationId: number
  onSuccess?: () => void
}

export function useDeleteInvitationFlow({ generationId, onSuccess }: Args) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.deleteInvitation())

  const remove = async (invitationId: number) => {
    try {
      await mutation.mutateAsync({ params: { invitationId } })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.invitations(generationId),
        }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.generations(),
        }),
      ])
      toast.success("초대 코드를 삭제했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("초대 코드 삭제에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return { remove, isPending: mutation.isPending }
}
