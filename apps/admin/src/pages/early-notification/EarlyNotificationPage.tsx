import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { TitleSection } from "@/widgets/heading"

import { CohortsAreaSkeleton } from "./components/CohortsAreaSkeleton"
import { EarlyNotificationContent } from "./EarlyNotificationContent"
import type { StatusFilterOption } from "./constants"

export default function EarlyNotificationPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")
  const [overrideCohortId, setOverrideCohortId] = useState<number | null>(
    null,
  )

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        title="사전 알림 신청"
        description="기수 모집 공지 신청자를 관리합니다."
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<CohortsAreaSkeleton />}>
          <EarlyNotificationContent
            searchText={searchText}
            statusFilter={statusFilter}
            overrideCohortId={overrideCohortId}
            onSearchChange={setSearchText}
            onStatusFilterChange={setStatusFilter}
            onCohortChange={setOverrideCohortId}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
