import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { ApiError, ErrorMessage, attendanceKeys } from "@ddd/api"

import { runVoteAction, VOTE_NOT_FOUND_DESCRIPTION } from "./voteAction"

const GENERATION_ID = 1
const VOTE_ID = 10

function setup(request: () => Promise<unknown>) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(attendanceKeys.votes(GENERATION_ID), [])
  queryClient.setQueryData(
    [...attendanceKeys.vote(VOTE_ID), "participation"],
    {}
  )
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")
  const notify = { success: vi.fn(), danger: vi.fn() }
  const run = (action: "open" | "close" | "delete") =>
    runVoteAction({
      action,
      voteId: VOTE_ID,
      generationId: GENERATION_ID,
      request,
      queryClient,
      notify,
    })
  return { queryClient, invalidate, notify, run }
}

const hasVoteCache = (queryClient: QueryClient) =>
  queryClient
    .getQueryCache()
    .findAll({ queryKey: attendanceKeys.vote(VOTE_ID) }).length > 0

const invalidatedVotes = (invalidate: { mock: { calls: unknown[][] } }) =>
  invalidate.mock.calls.some(
    (call) =>
      JSON.stringify((call[0] as { queryKey: unknown }).queryKey) ===
      JSON.stringify(attendanceKeys.votes(GENERATION_ID))
  )

describe("runVoteAction", () => {
  it("다른 운영자가 먼저 종료해 409 가 나면 서버 문구로 알리고 목록을 새로 불러온다", async () => {
    const message = ErrorMessage.ATTENDANCE_VOTE_INVALID_STATUS
    const { queryClient, invalidate, notify, run } = setup(() =>
      Promise.reject(new ApiError("ATTENDANCE_VOTE_INVALID_STATUS", message))
    )

    await run("close")

    expect(notify.danger).toHaveBeenCalledWith(
      "투표 종료에 실패했습니다",
      message
    )
    expect(notify.success).not.toHaveBeenCalled()
    expect(invalidatedVotes(invalidate)).toBe(true)
    expect(hasVoteCache(queryClient)).toBe(false)
  })

  it("다른 운영자가 먼저 삭제해 404 가 나면 삭제됐을 수 있다고 알리고 목록을 새로 불러온다", async () => {
    const { queryClient, invalidate, notify, run } = setup(() =>
      Promise.reject(
        new ApiError("ATTENDANCE_NOT_FOUND", ErrorMessage.ATTENDANCE_NOT_FOUND)
      )
    )

    await run("delete")

    expect(notify.danger).toHaveBeenCalledWith(
      "투표 삭제에 실패했습니다",
      VOTE_NOT_FOUND_DESCRIPTION
    )
    expect(invalidatedVotes(invalidate)).toBe(true)
    expect(hasVoteCache(queryClient)).toBe(false)
  })

  it("삭제에 성공하면 지운 투표 캐시를 지우고 목록만 새로 불러온다", async () => {
    const { queryClient, invalidate, notify, run } = setup(() =>
      Promise.resolve(null)
    )

    await run("delete")

    expect(notify.success).toHaveBeenCalledWith("투표를 삭제했습니다")
    expect(hasVoteCache(queryClient)).toBe(false)
    expect(invalidate).toHaveBeenCalledTimes(1)
    expect(invalidatedVotes(invalidate)).toBe(true)
  })

  it("종료에 성공하면 목록과 상세를 모두 새로 불러온다", async () => {
    const { queryClient, invalidate, notify, run } = setup(() =>
      Promise.resolve({})
    )

    await run("close")

    expect(notify.success).toHaveBeenCalledWith("투표를 종료했습니다")
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(hasVoteCache(queryClient)).toBe(true)
  })
})
