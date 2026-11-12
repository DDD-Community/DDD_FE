import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError, attendanceKeys, attendanceMutations } from "@ddd/api"

type Action = "open" | "close" | "delete"

const ACTION_MESSAGE = {
  open: { success: "투표를 시작했습니다", failure: "투표 시작에 실패했습니다" },
  close: {
    success: "투표를 종료했습니다",
    failure: "투표 종료에 실패했습니다",
  },
  delete: {
    success: "투표를 삭제했습니다",
    failure: "투표 삭제에 실패했습니다",
  },
} as const

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

  const act = async (action: Action) => {
    try {
      const args = { params: { voteId } }
      if (action === "open") await openMutation.mutateAsync(args)
      if (action === "close") await closeMutation.mutateAsync(args)
      if (action === "delete") await deleteMutation.mutateAsync(args)
      if (action === "delete") {
        queryClient.removeQueries({ queryKey: attendanceKeys.vote(voteId) })
        await queryClient.invalidateQueries({
          queryKey: attendanceKeys.votes(generationId),
        })
      } else {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: attendanceKeys.votes(generationId),
          }),
          queryClient.invalidateQueries({
            queryKey: attendanceKeys.vote(voteId),
          }),
        ])
      }
      toast.success(ACTION_MESSAGE[action].success)
    } catch (error) {
      toast.danger(ACTION_MESSAGE[action].failure, {
        description:
          error instanceof ApiError && error.code === "ATTENDANCE_NOT_FOUND"
            ? "투표를 찾을 수 없습니다. 다른 운영자가 삭제했을 수 있어 목록을 새로 불러옵니다."
            : error instanceof Error
              ? error.message
              : "잠시 후 다시 시도해 주세요.",
      })
      queryClient.removeQueries({ queryKey: attendanceKeys.vote(voteId) })
      await queryClient.invalidateQueries({
        queryKey: attendanceKeys.votes(generationId),
      })
    }
  }

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
