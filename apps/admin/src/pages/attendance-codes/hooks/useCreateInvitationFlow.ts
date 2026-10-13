import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { attendanceKeys, attendanceMutations } from "@ddd/api"
import type { PostAttendanceInvitationRequest } from "@ddd/api"

export function useCreateInvitationFlow(
  generationId: number,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient()
  const mutation = useMutation(attendanceMutations.createInvitation())

  const submit = async (payload: PostAttendanceInvitationRequest) => {
    try {
      await mutation.mutateAsync({ params: { generationId }, payload })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.invitations(generationId),
        }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.generations(),
        }),
      ])
      toast.success("초대 코드를 추가했습니다")
      onSuccess?.()
    } catch (error) {
      toast.danger("초대 코드 추가에 실패했습니다", {
        description: (error as Error).message,
      })
      throw error
    }
  }

  return { submit, isPending: mutation.isPending }
}
