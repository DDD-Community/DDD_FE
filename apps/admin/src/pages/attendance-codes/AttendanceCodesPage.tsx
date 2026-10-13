import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { TitleSection } from "@/shared/ui/Heading"

import { AttendanceCodesContent } from "./AttendanceCodesContent"
import { AttendanceCodesSkeleton } from "./components/AttendanceCodesSkeleton"

export default function AttendanceCodesPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        title="출석 코드 관리"
        description="출석앱 가입에 쓰는 기수·팀·초대코드를 관리합니다."
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<AttendanceCodesSkeleton />}>
          <AttendanceCodesContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
