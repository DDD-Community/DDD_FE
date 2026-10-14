import { describe, expect, it } from "vitest"

import { describeAttendanceSync } from "./attendanceSyncMessage"

describe("describeAttendanceSync", () => {
  it("summarizes a clean sync as success", () => {
    expect(
      describeAttendanceSync({
        status: "SYNCED",
        created: ["2026-11-07"],
        updated: ["2026-11-14"],
        deleted: [],
      })
    ).toEqual({
      tone: "success",
      title: "출석앱 일정을 맞췄습니다",
      description: "추가 1 · 수정 1 · 삭제 0",
    })
  })

  it("lists preserved, skipped, and ignored weeks as warnings", () => {
    expect(
      describeAttendanceSync({
        status: "SYNCED",
        kept: [{ date: "2026-11-07", reason: "HAS_ATTENDANCE" }],
        skipped: [{ date: "2026-11-14", reason: "DATE_TAKEN_BY_OTHER_GENERATION" }],
        ignoredWeeks: [3, 5],
      })
    ).toMatchObject({
      tone: "warning",
      description: expect.stringContaining(
        "출석 기록이 있어 지우지 않은 일정: 2026-11-07"
      ),
    })
  })

  it("silently skips unconfigured sync and explains other skipped reasons", () => {
    expect(
      describeAttendanceSync({ status: "SKIPPED", reason: "NOT_CONFIGURED" })
        .tone
    ).toBeNull()
    expect(
      describeAttendanceSync({ status: "SKIPPED", reason: "NAME_TOO_LONG" })
        .title
    ).toContain("5자")
    expect(
      describeAttendanceSync({ status: "SKIPPED", reason: "NO_VALID_WEEKS" })
        .title
    ).toContain("주차")
  })

  it("reports failed sync while keeping the cohort save successful", () => {
    expect(
      describeAttendanceSync({ status: "FAILED", message: "connection failed" })
    ).toEqual({
      tone: "warning",
      title: "기수는 저장됐지만 출석앱 일정 동기화에 실패했습니다",
      description: "connection failed",
    })
  })

  it("does not create a toast for a null result", () => {
    expect(describeAttendanceSync(null).tone).toBeNull()
  })
})
