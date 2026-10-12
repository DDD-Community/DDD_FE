import { Suspense, useState } from "react"
import { Button, ListBox, Select, Tabs } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { attendanceQueries } from "@ddd/api"
import type { AttendanceGeneration } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { StatCard } from "@/shared/ui/StatCard"

import { useDownloadAttendanceCsv } from "./hooks/useDownloadAttendanceCsv"
import { AttendanceMatrixTable } from "./components/AttendanceMatrixTable"
import { MemberSummaryTable } from "./components/MemberSummaryTable"
import { ScheduleSummaryTable } from "./components/ScheduleSummaryTable"
import { useAttendanceBoard } from "./hooks/useAttendanceBoard"
import { formatAttendanceRate } from "./lib/board"

export function AttendanceBoardContent() {
  const { data: generations } = useSuspenseQuery(
    attendanceQueries.getGenerations()
  )
  const [requestedId, setRequestedId] = useState<number | null>(null)
  const { download, isExporting } = useDownloadAttendanceCsv()
  const generation =
    generations.find((item) => item.id === requestedId) ??
    generations.reduce<AttendanceGeneration | null>(
      (latest, item) =>
        latest === null || item.id > latest.id ? item : latest,
      null
    )

  if (!generation)
    return <EmptyState>등록된 출석앱 기수가 없습니다.</EmptyState>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-white p-5 shadow">
        <div className="w-full max-w-xs space-y-2">
          <label className="text-xs font-medium text-gray-700">
            출석앱 기수
          </label>
          <Select
            aria-label="출석앱 기수"
            selectedKey={String(generation.id)}
            onSelectionChange={(key) => {
              if (key !== null) setRequestedId(Number(key))
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
        </div>
        <Button
          variant="outline"
          isDisabled={isExporting}
          onPress={() =>
            void download({
              generationId: generation.id,
              generationName: generation.name,
            })
          }
        >
          <HugeiconsIcon icon={Download04Icon} className="mr-2" />
          {isExporting ? "다운로드 중..." : "CSV 다운로드"}
        </Button>
      </div>
      <ErrorBoundary key={generation.id} FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
            </div>
          }
        >
          <AttendanceBoardData generation={generation} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function AttendanceBoardData({
  generation,
}: {
  generation: AttendanceGeneration
}) {
  const { board, matrix, memberRows, scheduleRows, overallRate } =
    useAttendanceBoard({ generationId: generation.id })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="회원 수" value={`${board.members.length}명`} />
        <StatCard title="일정 수" value={`${board.schedules.length}개`} />
        <StatCard
          title="전체 출석률"
          value={formatAttendanceRate(overallRate)}
        />
      </div>
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="출석 현황 보기">
            <Tabs.Tab id="attendance">
              출석부
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="members">
              회원별 누적
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="schedules">
              일정별 요약
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="attendance" className="py-4">
          <AttendanceMatrixTable board={board} matrix={matrix} />
        </Tabs.Panel>
        <Tabs.Panel id="members" className="py-4">
          <MemberSummaryTable rows={memberRows} />
        </Tabs.Panel>
        <Tabs.Panel id="schedules" className="py-4">
          <ScheduleSummaryTable rows={scheduleRows} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
