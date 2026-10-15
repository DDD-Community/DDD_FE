import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SEMESTER_PARTS } from "@/pages/semesters/constants"

import { readFormDraft } from "./formDraft"

const KEY = "semester-draft-test"

const storage = new Map<string, string>()

const draftWithCurriculum = (curriculum: unknown[]) => ({
  cohortNumber: "14",
  status: "UPCOMING",
  recruitStartDate: "",
  recruitEndDate: "",
  process: {
    documentResultDate: "",
    interviewStartDate: "",
    interviewEndDate: "",
    finalResultDate: "",
  },
  curriculum,
  parts: Object.fromEntries(
    SEMESTER_PARTS.map((part) => [part, { isOpen: false, questions: [] }])
  ),
})

describe("readFormDraft 커리큘럼 출석 시각", () => {
  beforeEach(() => {
    storage.clear()
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("시각 필드가 없거나 비어 있는 초안은 기본 14:00 으로 복원한다", () => {
    storage.set(
      KEY,
      JSON.stringify(
        draftWithCurriculum([
          { date: "2026-11-07", description: "OT" },
          { date: "2026-11-21", description: "부스팅 데이", time: "" },
        ])
      )
    )

    const draft = readFormDraft(KEY)

    expect(draft?.curriculum.map((week) => week.time)).toEqual([
      "14:00",
      "14:00",
    ])
  })

  it("초안에 저장된 시각은 그대로 복원한다", () => {
    storage.set(
      KEY,
      JSON.stringify(
        draftWithCurriculum([
          { date: "2026-11-07", description: "OT", time: "13:30" },
        ])
      )
    )

    expect(readFormDraft(KEY)?.curriculum[0].time).toBe("13:30")
  })
})
