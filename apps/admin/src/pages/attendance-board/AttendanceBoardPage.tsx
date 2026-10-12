import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { TitleSection } from "@/shared/ui/Heading"

import { AttendanceBoardContent } from "./AttendanceBoardContent"

export default function AttendanceBoardPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        title="출석 현황"
        description="출석앱 기수별 출석 데이터를 확인하고 CSV로 내려받습니다."
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
              출석 현황을 불러오는 중...
            </div>
          }
        >
          <AttendanceBoardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
