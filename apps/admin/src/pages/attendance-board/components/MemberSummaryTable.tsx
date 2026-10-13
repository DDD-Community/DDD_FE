import { Table } from "@heroui/react"

import { EmptyState } from "@/shared/ui/EmptyState"

import { type buildMemberRows, formatAttendanceRate } from "../lib/board"

type Rows = ReturnType<typeof buildMemberRows>

interface Props {
  rows: Rows
}

export function MemberSummaryTable({ rows }: Props) {
  if (rows.length === 0) {
    return <EmptyState>등록된 회원이 없습니다.</EmptyState>
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="회원별 출석 누적">
          <Table.Header>
            <Table.Column isRowHeader>회원</Table.Column>
            <Table.Column>팀</Table.Column>
            <Table.Column>직군</Table.Column>
            <Table.Column>출석</Table.Column>
            <Table.Column>지각</Table.Column>
            <Table.Column>결석</Table.Column>
            <Table.Column>출석률</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.name ?? "이름 없음"}</Table.Cell>
                <Table.Cell>{row.teamName ?? "-"}</Table.Cell>
                <Table.Cell>{row.job ?? "-"}</Table.Cell>
                <Table.Cell>{row.attended}</Table.Cell>
                <Table.Cell>{row.late}</Table.Cell>
                <Table.Cell>{row.absent}</Table.Cell>
                <Table.Cell>
                  {formatAttendanceRate(row.attendanceRate)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
