import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { ProjectsContent } from "./ProjectsContent"
import { ProjectsTableSkeleton } from "./components/ProjectsTableSkeleton"

/** 프로젝트 관리 페이지 */
export default function ProjectsPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ProjectsTableSkeleton />}>
          <ProjectsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
