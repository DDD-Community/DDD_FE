import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { earlyNotificationQueries, type CohortDto } from "@ddd/api"

import { RemindersTable } from "./components/RemindersTable"
import { STATUS_FILTER_PREDICATE, type StatusFilterOption } from "./constants"

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
    })
  )

  const filteredReminders = useMemo(() => {
    const statusPredicate = STATUS_FILTER_PREDICATE[statusFilter]
    return reminders
      .filter((item) =>
        searchText.trim() === ""
          ? true
          : item.email.toLowerCase().includes(searchText.trim().toLowerCase())
      )
      .filter((item) =>
        statusPredicate === null ? true : statusPredicate(item.notifiedAt)
      )
  }, [reminders, searchText, statusFilter])

  return <RemindersTable reminders={filteredReminders} cohorts={cohorts} />
}
