import { Skeleton } from "@heroui/react"

export function AttendanceGenerationDetailsSkeleton() {
  return (
    <div className="space-y-7">
      {["팀", "초대 코드"].map((section) => (
        <section key={section} className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-3/5 rounded" />
          </div>
        </section>
      ))}
    </div>
  )
}
