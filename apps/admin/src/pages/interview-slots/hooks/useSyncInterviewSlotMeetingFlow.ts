import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { interviewKeys, interviewMutations } from "@ddd/api"

/**
 * 회의 수동 동기화. 요청이 성공해도 회의가 준비되지 않았을 수 있어(캘린더 미연결 등)
 * 응답의 회의 상태로 안내를 나눈다.
 */
export function useSyncInterviewSlotMeetingFlow() {
  const queryClient = useQueryClient()
  const mutation = useMutation(interviewMutations.syncInterviewSlotMeeting())

  async function sync(id: number) {
    try {
      const slot = await mutation.mutateAsync({ params: { id } })
      if (slot.meeting.status === "READY") {
        toast.success("회의가 준비됐어요")
      } else {
        toast.warning("회의를 아직 준비하지 못했어요", {
          description: "회의 칸의 사유를 확인해 주세요.",
        })
      }
    } catch (error) {
      toast.danger("회의 동기화에 실패했어요", {
        description: (error as Error)?.message,
      })
    } finally {
      queryClient.invalidateQueries({ queryKey: interviewKeys.slotLists() })
    }
  }

  // 한 행의 요청이 다른 행의 버튼까지 막지 않도록 진행 중인 슬롯을 구분한다.
  const pendingId = mutation.isPending
    ? mutation.variables?.params.id
    : undefined

  return { sync, pendingId }
}
