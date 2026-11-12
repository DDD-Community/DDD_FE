import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { TitleSection } from "@/shared/ui/Heading"
import { AttendanceVotesContent } from "./AttendanceVotesContent"

export default function AttendanceVotesPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        title="출석 투표"
        description="출석앱 투표를 시작·종료하고 참여 현황과 결과를 확인합니다."
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="rounded-lg bg-white p-5">
              출석 투표를 불러오는 중...
            </div>
          }
        >
          <AttendanceVotesContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
