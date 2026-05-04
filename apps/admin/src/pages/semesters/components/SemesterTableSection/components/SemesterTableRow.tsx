import { Button, Table } from "@heroui/react"

import {
  NEXT_STATUS_BUTTON_LABEL,
  STATUS_LABEL,
  nextStatus,
} from "@/entities/cohort"

import type { CohortRow } from "../../../hooks"
import { DeleteCohortDialog } from "../../DeleteCohortDialog"
import { useState } from "react"

interface Props {
  row: CohortRow
  onEdit: () => void
  onTransition: () => void
}

export function SemesterTableRow({ row, onEdit, onTransition }: Props) {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const transitionLabel = NEXT_STATUS_BUTTON_LABEL[row.status]
  const canTransition = nextStatus(row.status) !== null

  const onDelete = () => {
    setOpenDeleteConfirm(true)
  }

  return (
    <>
      <Table.Row>
        <Table.Cell>{row.name}</Table.Cell>
        <Table.Cell>{STATUS_LABEL[row.status]}</Table.Cell>
        <Table.Cell>
          {formatPeriod(row.recruitStartAt, row.recruitEndAt)}
        </Table.Cell>
        <Table.Cell>{row.applicantsCount ?? "-"}</Table.Cell>
        <Table.Cell>{row.membersCount ?? "-"}</Table.Cell>
        <Table.Cell>
          {new Date(row.createdAt).toLocaleDateString("ko-KR")}
        </Table.Cell>
        <Table.Cell>
          <Button size="sm" variant="outline" className="mr-2" onPress={onEdit}>
            수정
          </Button>
          {canTransition && transitionLabel && (
            <Button size="sm" onPress={onTransition}>
              {transitionLabel}
            </Button>
          )}
          <Button size="sm" variant="danger" onPress={onDelete}>
            삭제
          </Button>
        </Table.Cell>
      </Table.Row>

      {row.id && (
        <DeleteCohortDialog
          targetId={row.id}
          isOpen={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
        />
      )}
    </>
  )
}

const formatPeriod = (start: string, end: string): string => {
  if (!start && !end) return "-"
  const left = start ? start.slice(0, 10) : "?"
  const right = end ? end.slice(0, 10) : "?"
  return `${left} ~ ${right}`
}
