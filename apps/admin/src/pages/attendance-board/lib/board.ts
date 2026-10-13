import type { AttendanceBoard, AttendanceStatus } from "@ddd/api"

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  ATTENDED: "출석",
  LATE: "지각",
  ABSENT: "결석",
  NONE: "-",
}

export const STATUS_COLOR: Record<
  AttendanceStatus,
  "success" | "warning" | "danger" | "default"
> = {
  ATTENDED: "success",
  LATE: "warning",
  ABSENT: "danger",
  NONE: "default",
}

export function buildStatusMatrix(board: AttendanceBoard) {
  const statusByCell = new Map(
    board.cells.map((cell) => [
      `${cell.memberId}:${cell.scheduleId}`,
      cell.status,
    ])
  )

  return board.members.map((member) => ({
    member,
    statuses: board.schedules.map(
      (schedule) =>
        statusByCell.get(`${member.id}:${schedule.id}`) ?? ("NONE" as const)
    ),
  }))
}

export function buildMemberRows(board: AttendanceBoard) {
  const summaries = new Map(
    board.memberSummaries.map((summary) => [summary.memberId, summary])
  )

  return board.members
    .map((member) => {
      const summary = summaries.get(member.id)
      const attended = summary?.attended ?? 0
      const late = summary?.late ?? 0
      const absent = summary?.absent ?? 0
      const total = attended + late + absent
      return {
        ...member,
        attended,
        late,
        absent,
        attendanceRate: total === 0 ? null : (attended + late) / total,
      }
    })
    .sort(
      (left, right) =>
        right.absent - left.absent ||
        (left.name ?? "").localeCompare(right.name ?? "", "ko")
    )
}

export function buildScheduleRows(board: AttendanceBoard) {
  const summaries = new Map(
    board.scheduleSummaries.map((summary) => [summary.scheduleId, summary])
  )

  return [...board.schedules]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((schedule) => ({
      ...schedule,
      ...(summaries.get(schedule.id) ?? {
        attended: 0,
        late: 0,
        absent: 0,
        none: 0,
      }),
    }))
}

export function formatScheduleLabel(date: string, name: string): string {
  const [, month, day] = date.split("-")
  return `${month}/${day} ${name}`
}

export function calculateOverallAttendanceRate(
  board: AttendanceBoard
): number | null {
  const totals = board.memberSummaries.reduce(
    (sum, row) => ({
      present: sum.present + row.attended + row.late,
      recorded: sum.recorded + row.attended + row.late + row.absent,
    }),
    { present: 0, recorded: 0 }
  )
  return totals.recorded === 0 ? null : totals.present / totals.recorded
}

export function formatAttendanceRate(rate: number | null): string {
  return rate === null ? "-" : `${Math.round(rate * 100)}%`
}
