import { describe, expect, it } from "vitest"

import type { AttendanceBoard } from "@ddd/api"

import {
  buildMemberRows,
  buildScheduleRows,
  buildStatusMatrix,
  calculateOverallAttendanceRate,
  formatAttendanceRate,
  formatScheduleLabel,
} from "./board"

const board: AttendanceBoard = {
  generation: { id: 1, name: "1기" },
  today: "2026-10-12",
  schedules: [
    { id: 2, name: "후속 일정", date: "2026-10-10", scheduleTime: "14:00" },
    { id: 1, name: "첫 일정", date: "2026-09-05", scheduleTime: "14:00" },
  ],
  members: [
    { id: 1, name: "가을", teamId: 1, teamName: "팀 A", job: "개발" },
    { id: 2, name: "나무", teamId: null, teamName: null, job: null },
    { id: 3, name: "다람", teamId: null, teamName: null, job: null },
  ],
  cells: [
    { memberId: 1, scheduleId: 1, status: "ATTENDED" },
    { memberId: 1, scheduleId: 2, status: "LATE" },
    { memberId: 2, scheduleId: 1, status: "ABSENT" },
  ],
  memberSummaries: [
    { memberId: 1, attended: 1, late: 1, absent: 0 },
    { memberId: 2, attended: 0, late: 0, absent: 2 },
    { memberId: 3, attended: 0, late: 0, absent: 0 },
  ],
  scheduleSummaries: [
    { scheduleId: 1, attended: 1, late: 0, absent: 1, none: 1 },
    { scheduleId: 2, attended: 0, late: 1, absent: 0, none: 2 },
  ],
}

describe("attendance board helpers", () => {
  it("uses NONE for cells missing from the response", () => {
    expect(buildStatusMatrix(board).map((row) => row.statuses)).toEqual([
      ["LATE", "ATTENDED"],
      ["NONE", "ABSENT"],
      ["NONE", "NONE"],
    ])
  })

  it("sorts member rows by absences descending and then name", () => {
    expect(buildMemberRows(board).map((row) => row.name)).toEqual([
      "나무",
      "가을",
      "다람",
    ])
  })

  it("returns null attendance rate when there are no attendance records", () => {
    expect(
      buildMemberRows(board).find((row) => row.id === 3)?.attendanceRate
    ).toBeNull()
    expect(
      buildMemberRows(board).find((row) => row.id === 1)?.attendanceRate
    ).toBe(1)
  })

  it("orders schedules by date and formats a short date label", () => {
    expect(buildScheduleRows(board).map((row) => row.id)).toEqual([1, 2])
    expect(formatScheduleLabel("2026-09-05", "첫 일정")).toBe("09/05 첫 일정")
  })
})

describe("calculateOverallAttendanceRate", () => {
  it("출석과 지각을 출석으로 보고 결석까지 합한 기록 수로 나눈다", () => {
    const rate = calculateOverallAttendanceRate({
      ...board,
      memberSummaries: [
        { memberId: 1, attended: 2, late: 1, absent: 1 },
        { memberId: 2, attended: 0, late: 0, absent: 0 },
      ],
    })
    expect(rate).toBe(0.75)
  })

  it("기록이 하나도 없으면 null 이다", () => {
    expect(
      calculateOverallAttendanceRate({ ...board, memberSummaries: [] })
    ).toBeNull()
  })
})

describe("formatAttendanceRate", () => {
  it("반올림한 퍼센트, null 은 - 로 표시한다", () => {
    expect(formatAttendanceRate(0.756)).toBe("76%")
    expect(formatAttendanceRate(null)).toBe("-")
  })
})
