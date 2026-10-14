import { Table } from "@heroui/react"

import { EmptyState } from "@/shared/ui/EmptyState"

import { buildScheduleRows } from "../lib/board"

type Rows = ReturnType<typeof buildScheduleRows>

interface Props {
  rows: Rows
}

export function ScheduleSummaryTable({ rows }: Props) {
  if (rows.length === 0) {
    return <EmptyState>등록된 일정이 없습니다.</EmptyState>
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="일정별 출석 요약">
          <Table.Header>
            <Table.Column isRowHeader>날짜</Table.Column>
            <Table.Column>일정명</Table.Column>
            <Table.Column>시각</Table.Column>
            <Table.Column>출석</Table.Column>
            <Table.Column>지각</Table.Column>
            <Table.Column>결석</Table.Column>
            <Table.Column>미정</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.date}</Table.Cell>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.scheduleTime?.slice(0, 5) ?? "-"}</Table.Cell>
                <Table.Cell>{row.attended}</Table.Cell>
                <Table.Cell>{row.late}</Table.Cell>
                <Table.Cell>{row.absent}</Table.Cell>
                <Table.Cell>{row.none}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
