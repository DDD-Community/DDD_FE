import { Suspense } from "react"
import { ListBox, Select } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { attendanceQueries } from "@ddd/api"
import { useSelectedAttendanceGeneration } from "@/shared/hooks/useSelectedAttendanceGeneration"
import { EmptyState } from "@/shared/ui/EmptyState"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { FormField } from "@/shared/ui/FormField"
import { VoteListTable } from "./components/VoteListTable"
import { VoteDetailPanel } from "./components/VoteDetailPanel"
import { useSelectedVote } from "./hooks/useSelectedVote"

export function AttendanceVotesContent() {
  const { data: generations } = useSuspenseQuery(
    attendanceQueries.getGenerations()
  )
  const { generation, select } = useSelectedAttendanceGeneration(generations)

  if (!generation)
    return <EmptyState>등록된 출석앱 기수가 없습니다.</EmptyState>

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-white p-5 shadow">
        <div className="w-full max-w-xs">
          <FormField label="출석앱 기수">
            <Select
              selectedKey={String(generation.id)}
              onSelectionChange={(key) => {
                if (key !== null) select(Number(key))
              }}
            >
              <Select.Trigger>
                <Select.Value>{generation.name}</Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {generations.map((item) => (
                    <ListBox.Item
                      key={item.id}
                      id={String(item.id)}
                      textValue={item.name}
                    >
                      {item.name}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </FormField>
        </div>
      </div>
      <ErrorBoundary key={generation.id} FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="rounded-lg bg-white p-5">
              투표 목록을 불러오는 중...
            </div>
          }
        >
          <VoteGenerationContent generationId={generation.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function VoteGenerationContent({ generationId }: { generationId: number }) {
  const { data: votes } = useSuspenseQuery(
    attendanceQueries.getVotes({ params: { generationId } })
  )
  const { vote: selectedVote, select } = useSelectedVote(votes)

  if (votes.length === 0)
    return <EmptyState>이 기수에 등록된 투표가 없습니다.</EmptyState>

  return (
    <div className="space-y-5">
      <VoteListTable
        votes={votes}
        selectedId={selectedVote?.voteId ?? null}
        onSelect={select}
      />
      {selectedVote && (
        <ErrorBoundary
          key={selectedVote.voteId}
          FallbackComponent={ErrorFallback}
        >
          <VoteDetailPanel
            key={selectedVote.voteId}
            vote={selectedVote}
            generationId={generationId}
            hasOpenVote={votes.some((vote) => vote.status === "OPEN")}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
