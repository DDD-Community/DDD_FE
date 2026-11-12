import type { QueryClient } from "@tanstack/react-query"
import { ApiError, attendanceKeys } from "@ddd/api"

export type VoteAction = "open" | "close" | "delete"

export const VOTE_ACTION_MESSAGE = {
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

export const VOTE_NOT_FOUND_DESCRIPTION =
  "투표를 찾을 수 없습니다. 다른 운영자가 삭제했을 수 있어 목록을 새로 불러옵니다."

interface Notify {
  success: (title: string) => void
  danger: (title: string, description: string) => void
}

export async function runVoteAction({
  action,
  voteId,
  generationId,
  request,
  queryClient,
  notify,
}: {
  action: VoteAction
  voteId: number
  generationId: number
  request: () => Promise<unknown>
  queryClient: QueryClient
  notify: Notify
}): Promise<void> {
  const votesKey = attendanceKeys.votes(generationId)
  const voteKey = attendanceKeys.vote(voteId)
  try {
    await request()
    if (action === "delete") {
      // 지운 투표를 다시 조회해 404 가 나지 않도록 캐시를 먼저 비운다.
      queryClient.removeQueries({ queryKey: voteKey })
      await queryClient.invalidateQueries({ queryKey: votesKey })
    } else {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: votesKey }),
        queryClient.invalidateQueries({ queryKey: voteKey }),
      ])
    }
    notify.success(VOTE_ACTION_MESSAGE[action].success)
  } catch (error) {
    // 다른 운영자가 먼저 상태를 바꾸거나 지운 경우가 대부분이라, 코드와 무관하게 목록을 최신화한다.
    notify.danger(
      VOTE_ACTION_MESSAGE[action].failure,
      error instanceof ApiError && error.code === "ATTENDANCE_NOT_FOUND"
        ? VOTE_NOT_FOUND_DESCRIPTION
        : error instanceof Error
          ? error.message
          : "잠시 후 다시 시도해 주세요."
    )
    queryClient.removeQueries({ queryKey: voteKey })
    await queryClient.invalidateQueries({ queryKey: votesKey })
  }
}
