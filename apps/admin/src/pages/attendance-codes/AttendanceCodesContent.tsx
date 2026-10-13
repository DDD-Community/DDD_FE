import { Suspense, useState } from "react"
import { Button } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { attendanceQueries } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { useSelectedAttendanceGeneration } from "@/shared/hooks/useSelectedAttendanceGeneration"

import { useDeleteGenerationFlow } from "./hooks/useDeleteGenerationFlow"
import { AttendanceDeleteDialog } from "./components/AttendanceDeleteDialog"
import { AttendanceGenerationDrawer } from "./components/AttendanceGenerationDrawer"
import { AttendanceGenerationDetails } from "./components/AttendanceGenerationDetails"
import { AttendanceGenerationDetailsSkeleton } from "./components/AttendanceGenerationDetailsSkeleton"

export function AttendanceCodesContent() {
  const { data: generations } = useSuspenseQuery(
    attendanceQueries.getGenerations()
  )
  const { generation: selectedGeneration, select } =
    useSelectedAttendanceGeneration(generations)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { remove, isPending } = useDeleteGenerationFlow({
    onSuccess: () => {
      setIsDeleteOpen(false)
      select(null)
    },
  })
  const handleDelete = async () => {
    if (!selectedGeneration) return
    await remove(selectedGeneration.id)
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-lg bg-white p-5 shadow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">출석앱 기수</h2>
            <p className="text-foreground-secondary text-sm">
              DDD 활동 기수와 별도로 관리됩니다.
            </p>
          </div>
          <Button onPress={() => setIsDrawerOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
            기수 추가
          </Button>
        </div>

        {generations.length === 0 ? (
          <EmptyState>등록된 출석앱 기수가 없습니다.</EmptyState>
        ) : (
          <div className="flex flex-wrap gap-2">
            {generations.map((generation) => (
              <Button
                key={generation.id}
                variant={
                  selectedGeneration?.id === generation.id
                    ? "primary"
                    : "outline"
                }
                onPress={() => select(generation.id)}
              >
                {generation.name}
                <span className="ml-2 text-xs">
                  회원 {generation.memberCount}명
                </span>
              </Button>
            ))}
          </div>
        )}
      </section>

      {selectedGeneration && (
        <section className="space-y-5 rounded-lg bg-white p-5 shadow">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {selectedGeneration.name} 관리
            </h2>
            <Button variant="danger" onPress={() => setIsDeleteOpen(true)}>
              <HugeiconsIcon icon={Delete02Icon} className="mr-2" />
              기수 삭제
            </Button>
          </div>
          <ErrorBoundary
            key={selectedGeneration.id}
            FallbackComponent={ErrorFallback}
          >
            <Suspense fallback={<AttendanceGenerationDetailsSkeleton />}>
              <AttendanceGenerationDetails generation={selectedGeneration} />
            </Suspense>
          </ErrorBoundary>
        </section>
      )}

      <AttendanceGenerationDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
      <AttendanceDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="출석앱 기수를 삭제하시겠습니까?"
        description="팀·회원·일정·초대코드가 연결된 기수는 삭제할 수 없습니다."
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
