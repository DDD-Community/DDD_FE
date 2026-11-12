import { useRef } from "react"
import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceMutations, type AttendanceVoteDetail } from "@ddd/api"

import { runVoteEditorFlow, type VoteEditorMode } from "../lib/voteEditorFlow"
import type { VoteEditorForm } from "../lib/voteTemplate"

export function useVoteEditorFlow({
  mode,
  generationId,
  voteId,
  original,
}: {
  mode: VoteEditorMode
  generationId: number
  voteId: number | null
  original?: AttendanceVoteDetail
}) {
  const queryClient = useQueryClient()
  const createMutation = useMutation(attendanceMutations.createVote())
  const updateMutation = useMutation(attendanceMutations.updateVote())
  const updateTextMutation = useMutation(attendanceMutations.updateVoteText())
  const submitting = useRef(false)

  async function submit(form: VoteEditorForm): Promise<number | null> {
    if (submitting.current) return null
    submitting.current = true
    try {
      return await runVoteEditorFlow({
        mode,
        generationId,
        voteId,
        original,
        form,
        request(payload) {
          if (mode === "create" || mode === "duplicate") {
            return createMutation.mutateAsync({
              params: { generationId },
              payload,
            })
          }
          if (voteId === null) throw new Error("투표를 찾을 수 없습니다.")
          if (mode === "text") {
            return updateTextMutation.mutateAsync({
              params: { voteId },
              payload,
            })
          }
          return updateMutation.mutateAsync({ params: { voteId }, payload })
        },
        queryClient,
        notify: {
          success: (title) => toast.success(title),
          danger: (title, description) => toast.danger(title, { description }),
        },
      })
    } finally {
      submitting.current = false
    }
  }

  return {
    submit,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      updateTextMutation.isPending,
  }
}
