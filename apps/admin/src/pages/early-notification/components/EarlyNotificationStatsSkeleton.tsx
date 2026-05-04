import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"

export const EarlyNotificationStatsSkeleton = () => {
  return (
    <GridBox className="grid-cols-3 gap-5">
      <StatCard.Skeleton />
      <StatCard.Skeleton />
      <StatCard.Skeleton />
    </GridBox>
  )
}
