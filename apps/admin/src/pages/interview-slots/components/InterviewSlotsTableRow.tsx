import { Button, Table } from "@heroui/react"

import type { CohortDto, InterviewSlot } from "@ddd/api"
import { InterviewSlotMeetingCell } from "./InterviewSlotMeetingCell"

type Props = {
  slot: InterviewSlot
  cohorts: CohortDto[]
  onEdit: () => void
  onDelete: () => void
  onOpenReservations: () => void
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ko-KR")

const formatTimeRange = (startIso: string, endIso: string): string => {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  return `${fmt(startIso)} ~ ${fmt(endIso)}`
}

export const InterviewSlotsTableRow = ({
  slot,
  cohorts,
  onEdit,
  onDelete,
  onOpenReservations,
}: Props) => {
  const allParts = cohorts.flatMap((c) => c.parts ?? [])
  const partName = allParts.find((p) => p.id === slot.cohortPartId)?.partName
  const partLabel = partName ? partName : "-"

  return (
    <Table.Row>
      <Table.Cell>{formatDate(slot.startAt)}</Table.Cell>
      <Table.Cell>{formatTimeRange(slot.startAt, slot.endAt)}</Table.Cell>
      <Table.Cell>{partLabel}</Table.Cell>
      <Table.Cell>
        <Button
          size="sm"
          variant="tertiary"
          onPress={onOpenReservations}
          aria-label={`예약자 ${slot.reservedCount}명 보기`}
        >
          {slot.reservedCount}/{slot.capacity}
        </Button>
      </Table.Cell>
      <Table.Cell>{slot.location ?? "-"}</Table.Cell>
      <Table.Cell>
        <InterviewSlotMeetingCell slot={slot} />
      </Table.Cell>
      <Table.Cell>
        <Button size="sm" variant="outline" className="mr-2" onPress={onEdit}>
          수정
        </Button>
        <Button size="sm" variant="danger" onPress={onDelete}>
          삭제
        </Button>
      </Table.Cell>
    </Table.Row>
  )
}
