import type { QueryClient } from "@tanstack/react-query"
import {
  ApiError,
  attendanceKeys,
  type AttendanceVoteDetail,
  type UpsertAttendanceVoteRequest,
} from "@ddd/api"

import {
  formToRequest,
  isSameStructure,
  withOriginalOrder,
  type VoteEditorForm,
} from "./voteTemplate"

export type VoteEditorMode = "create" | "duplicate" | "edit" | "text"

interface Notify {
  success: (title: string) => void
  danger: (title: string, description: string) => void
}

const STALE_VOTE_CODES = new Set([
  "ATTENDANCE_VOTE_NOT_DRAFT",
  "ATTENDANCE_VOTE_NOT_OPEN",
  "ATTENDANCE_NOT_FOUND",
])

const SUCCESS_TITLE: Record<VoteEditorMode, string> = {
  create: "투표를 만들었습니다",
  duplicate: "투표를 만들었습니다",
  edit: "투표를 저장했습니다",
  text: "글자를 수정했습니다",
}

const FAILURE_TITLE: Record<VoteEditorMode, string> = {
  create: "투표 생성에 실패했습니다",
  duplicate: "투표 생성에 실패했습니다",
  edit: "투표 저장에 실패했습니다",
  text: "글자 수정에 실패했습니다",
}

export async function runVoteEditorFlow({
  mode,
  generationId,
  voteId,
  original,
  form,
  request,
  queryClient,
  notify,
}: {
  mode: VoteEditorMode
  generationId: number
  voteId: number | null
  original?: AttendanceVoteDetail
  form: VoteEditorForm
  request: (
    payload: UpsertAttendanceVoteRequest
  ) => Promise<AttendanceVoteDetail>
  queryClient: QueryClient
  notify: Notify
}): Promise<number | null> {
  const payload =
    mode === "text" && original
      ? withOriginalOrder(original, formToRequest(form))
      : formToRequest(form)
  if (mode === "text" && (!original || !isSameStructure(original, payload))) {
    notify.danger(
      "글자 수정에 실패했습니다",
      "진행 중인 투표는 글자만 수정할 수 있습니다."
    )
    return null
  }

  try {
    const result = await request(payload)
    const savedVoteId = result.voteId
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.votes(generationId),
      }),
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.vote(savedVoteId),
      }),
    ])
    notify.success(SUCCESS_TITLE[mode])
    return savedVoteId
  } catch (error) {
    notify.danger(
      FAILURE_TITLE[mode],
      error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."
    )
    if (error instanceof ApiError && STALE_VOTE_CODES.has(error.code)) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.votes(generationId),
        }),
        ...(voteId === null
          ? []
          : [
              queryClient.invalidateQueries({
                queryKey: attendanceKeys.vote(voteId),
              }),
            ]),
      ])
    }
    return null
  }
}
