import { Skeleton } from "@heroui/react"

export function AttendanceBoardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <div className="space-y-4 rounded-lg bg-white p-5 shadow">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  )
}
