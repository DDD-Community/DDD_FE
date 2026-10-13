import { Skeleton } from "@heroui/react"

export function AttendanceCodesSkeleton() {
  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-lg bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
        </div>
      </section>
      <section className="space-y-4 rounded-lg bg-white p-5 shadow">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded" />
      </section>
    </div>
  )
}
