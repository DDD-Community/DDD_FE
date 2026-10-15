import { describe, expect, it } from "vitest"

import type { CohortDto } from "@ddd/api"

import { serializeCohortToForm } from "./serialize"

const cohortWith = (curriculum: unknown[]): CohortDto =>
  ({
    id: 1,
    name: "14기",
    status: "UPCOMING",
    recruitStartAt: "2026-09-01T00:00:00.000Z",
    recruitEndAt: "2026-09-15T00:00:00.000Z",
    process: null,
    curriculum,
    parts: [],
    attendanceSync: null,
  }) as unknown as CohortDto

describe("serializeCohortToForm 커리큘럼 출석 시각", () => {
  it("저장된 시각이 없는 주차는 기본 14:00 으로 채운다", () => {
    const form = serializeCohortToForm(
      cohortWith([{ date: "2026-11-07", description: "오리엔테이션" }])
    )

    expect(form.curriculum[0].time).toBe("14:00")
    expect(form.curriculum[8].time).toBe("14:00")
  })

  it("저장된 시각이 있으면 그대로 유지한다", () => {
    const form = serializeCohortToForm(
      cohortWith([{ date: "2026-11-07", description: "OT", time: "13:30" }])
    )

    expect(form.curriculum[0].time).toBe("13:30")
  })
})
