import { Table } from "@heroui/react"

import type { CohortDto, EarlyNotificationDto } from "@ddd/api"

import { STATUS_LABEL } from "../constants"

type EarlyNotificationTableProps = {
  reminders: EarlyNotificationDto[]
  cohorts: CohortDto[]
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ko-KR")

const formatDateTime = (iso?: string): string =>
  iso ? new Date(iso).toLocaleString("ko-KR") : "-"

export const EarlyNotificationTable = ({
  reminders,
  cohorts,
}: EarlyNotificationTableProps) => {
  const cohortNameById = new Map(cohorts.map((c) => [c.id, c.name]))

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="사전 알림 신청 목록"
          className="min-w-[720px]"
        >
          <Table.Header>
            <Table.Column isRowHeader>이메일</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>신청일</Table.Column>
            <Table.Column>상태</Table.Column>
            <Table.Column>발송 일시</Table.Column>
          </Table.Header>

          <Table.Body>
            {reminders.map((reminder) => (
              <Table.Row key={reminder.id}>
                <Table.Cell>{reminder.email}</Table.Cell>
                <Table.Cell>
                  {cohortNameById.get(reminder.cohortId) ?? "-"}
                </Table.Cell>
                <Table.Cell>{formatDate(reminder.createdAt)}</Table.Cell>
                <Table.Cell>
                  {reminder.notifiedAt
                    ? STATUS_LABEL.notified
                    : STATUS_LABEL.pending}
                </Table.Cell>
                <Table.Cell>{formatDateTime(reminder.notifiedAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
