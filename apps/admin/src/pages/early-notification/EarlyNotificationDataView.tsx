import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"

import {
  earlyNotificationQueries,
  type CohortDto,
} from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"

import { RemindersStatsSection } from "./components/RemindersStatsSection"
import { RemindersTable } from "./components/RemindersTable"
import {
  STATUS_FILTER_PREDICATE,
  type StatusFilterOption,
} from "./constants"

type EarlyNotificationDataViewProps = {
  cohortId: number
  cohorts: CohortDto[]
  searchText: string
  statusFilter: StatusFilterOption
}

export const EarlyNotificationDataView = ({
  cohortId,
  cohorts,
  searchText,
  statusFilter,
}: EarlyNotificationDataViewProps) => {
  const { data: reminders } = useSuspenseQuery(
    earlyNotificationQueries.getAdminEarlyNotifications({
      params: { cohortId },
    }),
  )

  const filteredReminders = useMemo(() => {
    const statusPredicate = STATUS_FILTER_PREDICATE[statusFilter]
    return reminders
      .filter((item) =>
        searchText.trim() === ""
          ? true
          : item.email
              .toLowerCase()
              .includes(searchText.trim().toLowerCase()),
      )
      .filter((item) =>
        statusPredicate === null ? true : statusPredicate(item.notifiedAt),
      )
  }, [reminders, searchText, statusFilter])

  if (reminders.length === 0) {
    return (
      <EmptyState>
        해당 기수에 사전 알림 신청자가 없습니다.
      </EmptyState>
    )
  }

  return (
    <>
      <RemindersStatsSection reminders={reminders} />
      <RemindersTable reminders={filteredReminders} cohorts={cohorts} />
    </>
  )
}
