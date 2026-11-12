import { Suspense, useState } from "react"
import {
  Button,
  buttonVariants,
  Card,
  Chip,
  Dropdown,
  Label,
  Tabs,
} from "@heroui/react"
import { ErrorBoundary } from "react-error-boundary"
import type { AttendanceVoteExportKind, AttendanceVoteSummary } from "@ddd/api"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { VoteConfirmDialog } from "./VoteConfirmDialog"
import { VoteFeedbackResults } from "./VoteFeedbackResults"
import { VoteParticipation } from "./VoteParticipation"
import { VoteTeamResults } from "./VoteTeamResults"
import { useDownloadVoteCsv } from "../hooks/useDownloadVoteCsv"
import { useVoteActionFlow } from "../hooks/useVoteActionFlow"
import {
  formatVoteDateTime,
  VOTE_CSV_LABEL,
  VOTE_STATUS_COLOR,
  VOTE_STATUS_LABEL,
} from "../lib/vote"

type Action = "open" | "close" | "delete"

const CONFIRM: Record<
  Action,
  {
    title: string
    description: string
    label: string
    variant: "primary" | "danger"
  }
> = {
  open: {
    title: "투표를 시작할까요?",
    description:
      "멤버는 출석앱을 다시 열거나 홈 화면에 다시 들어오면 투표를 볼 수 있습니다(푸시 알림 없음). 한 기수에 진행 중인 투표는 하나만 둘 수 있습니다.",
    label: "시작",
    variant: "primary",
  },
  close: {
    title: "투표를 종료할까요?",
    description:
      "종료하면 다시 열 수 없습니다. 작성 중인 멤버도 더 이상 제출할 수 없습니다.",
    label: "종료",
    variant: "danger",
  },
  delete: {
    title: "투표를 삭제할까요?",
    description:
      "작성 중인 투표를 삭제합니다. 삭제한 투표는 되돌릴 수 없습니다.",
    label: "삭제",
    variant: "danger",
  },
}

function VoteTabContent({
  voteId,
  children,
}: {
  voteId: number
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary key={voteId} FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={<div className="py-5 text-sm">결과를 불러오는 중...</div>}
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export function VoteDetailPanel({
  vote,
  generationId,
  hasOpenVote,
  onEdit,
}: {
  vote: AttendanceVoteSummary
  generationId: number
  hasOpenVote: boolean
  onEdit: (mode: "edit" | "text" | "duplicate") => void
}) {
  const voteId = vote.voteId
  const [action, setAction] = useState<Action | null>(null)
  const { act, refresh, isPending } = useVoteActionFlow({
    generationId,
    voteId,
  })
  const { download, isExporting } = useDownloadVoteCsv()

  const confirm = async () => {
    if (!action) return
    // 실패해도 닫는다. 실패 시 목록을 다시 불러오므로 남겨 두면 지난 상태의 확인 창이 된다.
    await act(action)
    setAction(null)
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{vote.title}</h2>
            <Chip color={VOTE_STATUS_COLOR[vote.status]}>
              {VOTE_STATUS_LABEL[vote.status]}
            </Chip>
          </div>
          <div className="flex flex-wrap gap-2">
            {vote.status === "DRAFT" && (
              <Button variant="secondary" onPress={() => onEdit("edit")}>
                편집
              </Button>
            )}
            {vote.status === "OPEN" && (
              <Button variant="secondary" onPress={() => onEdit("text")}>
                글자 수정
              </Button>
            )}
            <Button variant="secondary" onPress={() => onEdit("duplicate")}>
              복제
            </Button>
            {vote.status === "DRAFT" && (
              <>
                <Button
                  variant="primary"
                  isDisabled={hasOpenVote}
                  onPress={() => setAction("open")}
                >
                  시작
                </Button>
                {hasOpenVote && (
                  <span className="text-muted-foreground text-sm">
                    진행 중인 투표를 먼저 종료해야 시작할 수 있습니다
                  </span>
                )}
                <Button variant="danger" onPress={() => setAction("delete")}>
                  삭제
                </Button>
              </>
            )}
            {vote.status === "OPEN" && (
              <>
                <Button variant="secondary" onPress={() => void refresh()}>
                  새로고침
                </Button>
                <Button variant="danger" onPress={() => setAction("close")}>
                  종료
                </Button>
              </>
            )}
            {vote.status !== "DRAFT" && (
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="CSV 다운로드"
                  className={buttonVariants({ variant: "outline" })}
                  isDisabled={isExporting}
                >
                  {isExporting ? "다운로드 중..." : "CSV 다운로드"}
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    aria-label="CSV 종류"
                    onAction={(key) =>
                      void download({
                        voteId,
                        title: vote.title,
                        kind: String(key) as AttendanceVoteExportKind,
                      })
                    }
                  >
                    {(
                      Object.entries(VOTE_CSV_LABEL) as [
                        AttendanceVoteExportKind,
                        string,
                      ][]
                    ).map(([kind, label]) => (
                      <Dropdown.Item key={kind} id={kind} textValue={label}>
                        <Label>{label}</Label>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </div>
        <Card.Content className="space-y-4">
          <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>시작 시각: {formatVoteDateTime(vote.openedAt)}</span>
            <span>종료 시각: {formatVoteDateTime(vote.closedAt)}</span>
            <span>제출 수: {vote.responseCount}</span>
          </div>
          {vote.status === "DRAFT" ? (
            <p className="rounded-lg bg-gray-50 p-5 text-sm">
              아직 시작하지 않은 투표입니다. 「편집」으로 내용을 고치고,
              시작하면 참여 현황과 결과를 볼 수 있습니다.
            </p>
          ) : (
            <Tabs>
              <Tabs.ListContainer>
                <Tabs.List aria-label="출석 투표 현황과 결과">
                  <Tabs.Tab id="participation">
                    참여 현황
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="team-results">
                    팀 투표 결과
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="feedback-results">
                    피드백 결과
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id="participation" className="py-4">
                <VoteTabContent voteId={voteId}>
                  <VoteParticipation voteId={voteId} status={vote.status} />
                </VoteTabContent>
              </Tabs.Panel>
              <Tabs.Panel id="team-results" className="py-4">
                <VoteTabContent voteId={voteId}>
                  <VoteTeamResults voteId={voteId} />
                </VoteTabContent>
              </Tabs.Panel>
              <Tabs.Panel id="feedback-results" className="py-4">
                <VoteTabContent voteId={voteId}>
                  <VoteFeedbackResults voteId={voteId} />
                </VoteTabContent>
              </Tabs.Panel>
            </Tabs>
          )}
        </Card.Content>
      </Card>
      {action && (
        <VoteConfirmDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setAction(null)
          }}
          title={CONFIRM[action].title}
          description={CONFIRM[action].description}
          confirmLabel={CONFIRM[action].label}
          confirmVariant={CONFIRM[action].variant}
          iconStatus={action === "open" ? "accent" : "danger"}
          pendingLabel={`${CONFIRM[action].label} 중...`}
          isPending={isPending}
          onConfirm={() => void confirm()}
        />
      )}
    </>
  )
}
