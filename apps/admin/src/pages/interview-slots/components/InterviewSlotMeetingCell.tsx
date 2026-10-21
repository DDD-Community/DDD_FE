import { Button } from "@heroui/react"

import type { InterviewSlot, InterviewSlotMeetingStatus } from "@ddd/api"

import { useSyncInterviewSlotMeetingFlow } from "../hooks/useSyncInterviewSlotMeetingFlow"

const STATUS_LABEL: Record<InterviewSlotMeetingStatus, string> = {
  NONE: "기존 방식",
  PENDING: "회의 준비 중",
  READY: "회의 준비됨",
  OUT_OF_SYNC: "동기화 필요",
  FAILED: "회의 생성 실패",
}

const ERROR_LABEL: Record<string, string> = {
  not_connected: "주인 면접관의 캘린더가 연결되지 않았어요.",
  reconnect_required: "주인 면접관의 캘린더를 다시 연결해야 해요.",
  conference_pending: "Meet 회의를 만들고 있어요.",
  request_failed: "Google 요청에 실패했어요.",
}

export function InterviewSlotMeetingCell({ slot }: { slot: InterviewSlot }) {
  const { sync, pendingId } = useSyncInterviewSlotMeetingFlow()
  const isPending = pendingId === slot.id
  const { meeting } = slot
  const needsAttention = ["PENDING", "OUT_OF_SYNC", "FAILED"].includes(
    meeting.status
  )
  const interviewers = [
    ...slot.interviewers.filter((interviewer) => interviewer.isHost),
    ...slot.interviewers.filter((interviewer) => !interviewer.isHost),
  ]

  return (
    <div className="min-w-40 space-y-1 text-sm">
      <p
        className={
          meeting.status === "NONE"
            ? "text-foreground-secondary"
            : "font-medium"
        }
      >
        {STATUS_LABEL[meeting.status]}
      </p>
      {meeting.status === "READY" && meeting.meetUrl && (
        <a
          href={meeting.meetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          회의 열기
        </a>
      )}
      {needsAttention && (
        <>
          {meeting.lastError && (
            <p className="text-foreground-secondary text-xs">
              {ERROR_LABEL[meeting.lastError] ?? "회의 상태를 확인해 주세요."}
            </p>
          )}
          <p className="text-xs text-warning">지원자에게 보이지 않음</p>
          <Button
            size="sm"
            variant="outline"
            isDisabled={isPending}
            onPress={() => sync(slot.id)}
          >
            {isPending ? "동기화 중..." : "다시 동기화"}
          </Button>
        </>
      )}
      {interviewers.length > 0 && (
        <p className="text-foreground-secondary text-xs">
          {interviewers
            .map(
              (interviewer) =>
                `${interviewer.name}${interviewer.isHost ? " (주인)" : ""}`
            )
            .join(", ")}
        </p>
      )}
    </div>
  )
}
