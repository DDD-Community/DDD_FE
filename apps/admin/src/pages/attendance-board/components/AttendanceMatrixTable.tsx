import { Chip, Table } from "@heroui/react"

import type { AttendanceBoard } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"

import {
  type buildStatusMatrix,
  formatScheduleLabel,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../lib/board"

interface Props {
  board: AttendanceBoard
  matrix: ReturnType<typeof buildStatusMatrix>
}

export function AttendanceMatrixTable({ board, matrix }: Props) {
  if (board.schedules.length === 0) {
    return <EmptyState>등록된 일정이 없습니다.</EmptyState>
  }
  if (board.members.length === 0) {
    return <EmptyState>등록된 회원이 없습니다.</EmptyState>
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="회원별 출석부" className="min-w-max">
          <Table.Header>
            <Table.Column isRowHeader>회원</Table.Column>
            <Table.Column>팀</Table.Column>
            <Table.Column>직군</Table.Column>
            {board.schedules.map((schedule) => (
              <Table.Column key={schedule.id}>
                {formatScheduleLabel(
                  schedule.date,
                  schedule.scheduleTime,
                  schedule.name
                )}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {matrix.map(({ member, statuses }) => (
              <Table.Row key={member.id}>
                <Table.Cell>{member.name ?? "이름 없음"}</Table.Cell>
                <Table.Cell>{member.teamName ?? "-"}</Table.Cell>
                <Table.Cell>{member.job ?? "-"}</Table.Cell>
                {statuses.map((status, index) => (
                  <Table.Cell
                    key={`${member.id}-${board.schedules[index]?.id}`}
                  >
                    <Chip color={STATUS_COLOR[status]}>
                      {STATUS_LABEL[status]}
                    </Chip>
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
