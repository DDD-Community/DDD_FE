// apps/admin/src/pages/reminders/components/RemindersStatsSection.tsx
import { useMemo } from "react"

import { earlyNotificationQueries } from "@ddd/api"

import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"
import { useSuspenseQuery } from "@tanstack/react-query"

type RemindersStatsSectionProps = {
  selectedCohort: { id: number; name: string }
}

export const RemindersStatsSection = ({
  selectedCohort,
}: RemindersStatsSectionProps) => {
  const { data: reminders } = useSuspenseQuery(
    earlyNotificationQueries.getAdminEarlyNotifications({
      params: { cohortId: selectedCohort.id },
    })
  )

  const stats = useMemo(() => {
    const total = reminders.length
    const notified = reminders.filter((r) => !!r.notifiedAt).length
    return { total, notified, pending: total - notified }
  }, [reminders])

  return (
    <GridBox className="grid-cols-3 gap-5">
      <StatCard title="전체 신청" value={`${stats.total}명`} footer="누적" />
      <StatCard title="대기" value={`${stats.pending}명`} footer="미발송" />
      <StatCard title="발송 완료" value={`${stats.notified}명`} footer="완료" />
    </GridBox>
  )
}
