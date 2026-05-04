import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "@heroui/react"

import { cohortQueries, type CohortDto } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { CohortsAreaSkeleton } from "./components/CohortsAreaSkeleton"
import { EarlyNotificationBulkSendDrawer } from "./components/EarlyNotificationBulkSendDrawer"
import { EarlyNotificationToolbar } from "./components/EarlyNotificationToolbar"
import { EarlyNotificationDataView } from "./EarlyNotificationDataView"
import { downloadEarlyNotificationsCsv } from "./lib/downloadEarlyNotificationsCsv"
import type { StatusFilterOption } from "./constants"
import { EarlyNotificationStatsSection } from "./components/EarlyNotificationStatsSection"

const pickActiveCohortId = (cohorts: CohortDto[]): number | null => {
  if (cohorts.length === 0) return null
  const open = cohorts.find((c) => c.status === "RECRUITING")
  if (open) return open.id
  const sorted = [...cohorts].sort(
    (a, b) =>
      new Date(b.recruitStartAt).getTime() -
      new Date(a.recruitStartAt).getTime()
  )
  return sorted[0]?.id ?? null
}

type EarlyNotificationContentProps = {
  searchText: string
  statusFilter: StatusFilterOption
  overrideCohortId: number | null
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: StatusFilterOption) => void
  onCohortChange: (id: number) => void
}

export const EarlyNotificationContent = ({
  searchText,
  statusFilter,
  overrideCohortId,
  onSearchChange,
  onStatusFilterChange,
  onCohortChange,
}: EarlyNotificationContentProps) => {
  const { data: cohorts } = useSuspenseQuery(cohortQueries.getCohorts())
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  if (cohorts.length === 0) {
    return <EmptyState>등록된 기수가 없습니다.</EmptyState>
  }

  const effectiveCohortId = overrideCohortId ?? pickActiveCohortId(cohorts)
  // cohorts.length > 0 이므로 effectiveCohortId 는 number 보장.
  // 타입 시스템상 null 가능성을 좁히기 위한 가드.
  if (effectiveCohortId === null) {
    return <EmptyState>활성 기수를 결정할 수 없습니다.</EmptyState>
  }

  const selectedCohort = cohorts.find((c) => c.id === effectiveCohortId)
  if (!selectedCohort) {
    return <EmptyState>선택된 기수를 찾을 수 없습니다.</EmptyState>
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadEarlyNotificationsCsv({
        cohortId: effectiveCohortId,
        cohortName: selectedCohort.name,
      })
    } catch (error) {
      toast.danger("CSV 내보내기에 실패했습니다", {
        description:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <Suspense fallback={<CohortsAreaSkeleton />}>
        <EarlyNotificationStatsSection selectedCohort={selectedCohort} />
      </Suspense>

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <EarlyNotificationToolbar
          searchText={searchText}
          onSearchChange={onSearchChange}
          cohorts={cohorts}
          cohortId={effectiveCohortId}
          onCohortChange={onCohortChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onOpenBulkSend={() => setIsBulkSendOpen(true)}
          isBulkSendDisabled={false}
          onExportCsv={handleExport}
          isExporting={isExporting}
          isExportDisabled={isExporting}
        />
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CohortsAreaSkeleton />}>
            <EarlyNotificationDataView
              cohortId={effectiveCohortId}
              cohorts={cohorts}
              searchText={searchText}
              statusFilter={statusFilter}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      <EarlyNotificationBulkSendDrawer
        isOpen={isBulkSendOpen}
        onOpenChange={setIsBulkSendOpen}
        cohortId={effectiveCohortId}
        cohortName={selectedCohort.name}
      />
    </div>
  )
}
