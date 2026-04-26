import { useMemo, useState } from "react"

import {
  useAdminEarlyNotifications,
  useCohorts,
  type CohortDto,
} from "@ddd/api"

import { CardSection, TitleSection } from "./components/Sections"
import { RemindersBulkSendDrawer } from "./components/RemindersBulkSendDrawer"
import { RemindersTable } from "./components/RemindersTable"
import { RemindersToolbar } from "./components/RemindersToolbar"
import {
  STATUS_FILTER_PREDICATE,
  type StatusFilterOption,
} from "./constants"

const pickActiveCohortId = (cohorts: CohortDto[] | undefined): number | null => {
  if (!cohorts || cohorts.length === 0) return null
  const open = cohorts.find((c) => c.status === "RECRUITING")
  if (open) return open.id
  const sorted = [...cohorts].sort(
    (a, b) =>
      new Date(b.recruitStartAt).getTime() -
      new Date(a.recruitStartAt).getTime(),
  )
  return sorted[0]?.id ?? null
}

export default function RemindersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")
  const [overrideCohortId, setOverrideCohortId] = useState<number | null>(null)
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false)

  const { data: cohorts } = useCohorts()
  const cohortList = useMemo(() => cohorts ?? [], [cohorts])
  const defaultCohortId = useMemo(
    () => pickActiveCohortId(cohortList),
    [cohortList],
  )
  const effectiveCohortId = overrideCohortId ?? defaultCohortId

  const { data: reminders } = useAdminEarlyNotifications({
    params: {
      cohortId: effectiveCohortId ?? 0,
    },
  })

  const remindersList = useMemo(() => reminders ?? [], [reminders])

  const filteredReminders = useMemo(() => {
    const statusPredicate = STATUS_FILTER_PREDICATE[statusFilter]
    return remindersList
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
  }, [remindersList, searchText, statusFilter])

  const stats = useMemo(() => {
    const total = remindersList.length
    const notified = remindersList.filter((r) => !!r.notifiedAt).length
    return { total, notified, pending: total - notified }
  }, [remindersList])

  const selectedCohort = cohortList.find((c) => c.id === effectiveCohortId)

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <CardSection
        total={stats.total}
        pending={stats.pending}
        notified={stats.notified}
      />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        {effectiveCohortId === null ? (
          <p className="py-12 text-center text-sm text-gray-500">
            등록된 기수가 없습니다.
          </p>
        ) : (
          <>
            <RemindersToolbar
              searchText={searchText}
              onSearchChange={setSearchText}
              cohorts={cohortList}
              cohortId={effectiveCohortId}
              onCohortChange={setOverrideCohortId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onOpenBulkSend={() => setIsBulkSendOpen(true)}
              isBulkSendDisabled={remindersList.length === 0}
            />
            <RemindersTable
              reminders={filteredReminders}
              cohorts={cohortList}
            />
          </>
        )}
      </div>

      {effectiveCohortId !== null && selectedCohort && (
        <RemindersBulkSendDrawer
          isOpen={isBulkSendOpen}
          onOpenChange={setIsBulkSendOpen}
          cohortId={effectiveCohortId}
          cohortName={selectedCohort.name}
        />
      )}
    </div>
  )
}
