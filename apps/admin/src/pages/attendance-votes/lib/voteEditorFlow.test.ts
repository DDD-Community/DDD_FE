import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { ApiError, attendanceKeys, type AttendanceVoteDetail } from "@ddd/api"

import { runVoteEditorFlow } from "./voteEditorFlow"
import { emptyVoteForm } from "./voteTemplate"

const generationId = 3
const voteId = 7

function detail(): AttendanceVoteDetail {
  return {
    voteId,
    generationId,
    title: "기존 투표",
    status: "DRAFT",
    templateVersion: 1,
    openedAt: null,
    closedAt: null,
    createdDate: "2026-11-12",
    responseCount: 0,
    teamVoteTemplate: null,
    feedbackTemplate: null,
  }
}

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")
  const notify = { success: vi.fn(), danger: vi.fn() }
  return { queryClient, invalidate, notify }
}

describe("runVoteEditorFlow", () => {
  it("creates a vote, invalidates list and detail, and returns its ID", async () => {
    const { queryClient, invalidate, notify } = setup()
    const request = vi.fn(async () => detail())
    const form = emptyVoteForm()
    form.title = "새 투표"

    const result = await runVoteEditorFlow({
      mode: "create",
      generationId,
      voteId: null,
      form,
      request,
      queryClient,
      notify,
    })

    expect(result).toBe(voteId)
    expect(request).toHaveBeenCalledOnce()
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: attendanceKeys.votes(generationId),
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: attendanceKeys.vote(voteId),
    })
    expect(notify.success).toHaveBeenCalledWith("투표를 만들었습니다")
  })

  it("rejects a structure change in text mode before sending a request", async () => {
    const { queryClient, notify } = setup()
    const request = vi.fn(async () => detail())
    const form = emptyVoteForm()
    form.title = "수정"

    const result = await runVoteEditorFlow({
      mode: "text",
      generationId,
      voteId,
      original: detail(),
      form,
      request,
      queryClient,
      notify,
    })

    expect(result).toBeNull()
    expect(request).not.toHaveBeenCalled()
    expect(notify.danger).toHaveBeenCalledWith(
      "글자 수정에 실패했습니다",
      "진행 중인 투표는 글자만 수정할 수 있습니다."
    )
  })

  it("keeps server validation text and leaves cache intact", async () => {
    const { queryClient, invalidate, notify } = setup()
    const message = "부문 이름이 올바르지 않습니다."
    const request = vi.fn(async (): Promise<AttendanceVoteDetail> => {
      throw new ApiError("ATTENDANCE_VOTE_TEMPLATE_INVALID", message)
    })

    const result = await runVoteEditorFlow({
      mode: "edit",
      generationId,
      voteId,
      form: emptyVoteForm(),
      request,
      queryClient,
      notify,
    })

    expect(result).toBeNull()
    expect(notify.danger).toHaveBeenCalledWith(
      "투표 저장에 실패했습니다",
      message
    )
    expect(invalidate).not.toHaveBeenCalled()
  })

  it("refreshes list and detail after a stale vote status", async () => {
    const { queryClient, invalidate, notify } = setup()
    const request = vi.fn(async (): Promise<AttendanceVoteDetail> => {
      throw new ApiError("ATTENDANCE_VOTE_NOT_DRAFT", "이미 시작된 투표입니다.")
    })

    const result = await runVoteEditorFlow({
      mode: "edit",
      generationId,
      voteId,
      form: emptyVoteForm(),
      request,
      queryClient,
      notify,
    })

    expect(result).toBeNull()
    expect(notify.danger).toHaveBeenCalledWith(
      "투표 저장에 실패했습니다",
      "이미 시작된 투표입니다."
    )
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: attendanceKeys.votes(generationId),
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: attendanceKeys.vote(voteId),
    })
  })
})
