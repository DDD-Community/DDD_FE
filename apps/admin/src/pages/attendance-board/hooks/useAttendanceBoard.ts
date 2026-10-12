import { useSuspenseQuery } from "@tanstack/react-query"

import { attendanceQueries } from "@ddd/api"

import {
  buildMemberRows,
  buildScheduleRows,
  buildStatusMatrix,
  calculateOverallAttendanceRate,
} from "../lib/board"

export function useAttendanceBoard({ generationId }: { generationId: number }) {
  const { data: board } = useSuspenseQuery(
    attendanceQueries.getBoard({ params: { generationId } })
  )

  return {
    board,
    matrix: buildStatusMatrix(board),
    memberRows: buildMemberRows(board),
    scheduleRows: buildScheduleRows(board),
    overallRate: calculateOverallAttendanceRate(board),
  }
}
