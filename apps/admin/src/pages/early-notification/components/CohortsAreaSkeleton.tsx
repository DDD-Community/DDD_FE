import { EarlyNotificationStatsSkeleton } from "./EarlyNotificationStatsSkeleton"
import { EarlyNotificationTableSkeleton } from "./EarlyNotificationTableSkeleton"

export const CohortsAreaSkeleton = () => {
  return (
    <div className="space-y-5">
      <EarlyNotificationStatsSkeleton />
      <div className="rounded-lg bg-white p-5 shadow">
        <EarlyNotificationTableSkeleton />
      </div>
    </div>
  )
}
