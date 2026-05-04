import { RemindersStatsSkeleton } from "./RemindersStatsSkeleton"
import { RemindersTableSkeleton } from "./RemindersTableSkeleton"

export const CohortsAreaSkeleton = () => {
  return (
    <div className="space-y-5">
      <RemindersStatsSkeleton />
      <div className="rounded-lg bg-white p-5 shadow">
        <RemindersTableSkeleton />
      </div>
    </div>
  )
}
