import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceKeys, attendanceMutations } from "@ddd/api"

import { runVoteAction, type VoteAction } from "../lib/voteAction"

export function useVoteActionFlow({
  generationId,
  voteId,
}: {
  generationId: number
  voteId: number
}) {
  const queryClient = useQueryClient()
  const openMutation = useMutation(attendanceMutations.openVote())
  const closeMutation = useMutation(attendanceMutations.closeVote())
  const deleteMutation = useMutation(attendanceMutations.deleteVote())
  const mutations = {
    open: openMutation,
    close: closeMutation,
    delete: deleteMutation,
  }

  const act = (action: VoteAction) =>
    runVoteAction({
      action,
      voteId,
      generationId,
      request: () => mutations[action].mutateAsync({ params: { voteId } }),
      queryClient,
      notify: {
        success: (title) => toast.success(title),
        danger: (title, description) => toast.danger(title, { description }),
      },
    })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: attendanceKeys.vote(voteId) }),
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.votes(generationId),
      }),
    ])

  return {
    act,
    refresh,
    isPending:
      openMutation.isPending ||
      closeMutation.isPending ||
      deleteMutation.isPending,
  }
}
