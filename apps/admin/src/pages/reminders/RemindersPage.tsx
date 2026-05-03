// apps/admin/src/pages/reminders/RemindersPage.tsx
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { CohortsAreaSkeleton } from "./components/CohortsAreaSkeleton"
import { TitleSection } from "./components/Sections"
import { RemindersContent } from "./RemindersContent"
import type { StatusFilterOption } from "./constants"

export default function RemindersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")
  const [overrideCohortId, setOverrideCohortId] = useState<number | null>(
    null,
  )

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<CohortsAreaSkeleton />}>
          <RemindersContent
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
