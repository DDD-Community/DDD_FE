import { describe, expect, it } from "vitest"

import { CohortPartConfigDtoName, type InterviewSlot } from "@ddd/api"

import {
  serializeBulkFormToCreatePayloads,
  serializeFormToCreatePayload,
  serializeFormToUpdatePayload,
  serializeSlotToForm,
} from "./serialize"
import { InterviewSlotFormSchema, type InterviewSlotForm } from "../types"

const form: InterviewSlotForm = {
  cohortId: 1,
  cohortPartId: 2,
  cohortPartName: CohortPartConfigDtoName.PM,
  date: "2026-09-10",
  startTime: "14:00",
  endTime: "14:30",
  capacity: 1,
  location: "",
  description: "",
  interviewerUserIds: [11, 12],
}

describe("면접관 슬롯 직렬화", () => {
  it("Meet 모드에서 기본 장소를 넣는다", () => {
    expect(serializeFormToCreatePayload(form)).toMatchObject({
      location: "온라인 (Google Meet)",
      interviewerUserIds: [11, 12],
    })
    expect(serializeFormToUpdatePayload(form)).toMatchObject({
      location: "온라인 (Google Meet)",
      interviewerUserIds: [11, 12],
    })
  })

  it("기존 방식 생성은 빈 면접관 목록을 생략한다", () => {
    expect(
      serializeFormToCreatePayload({
        ...form,
        location: "회의실",
        interviewerUserIds: [],
      })
    ).not.toHaveProperty("interviewerUserIds")
  })

  it("수정은 빈 목록을 보내 면접관을 지운다", () => {
    expect(
      serializeFormToUpdatePayload({
        ...form,
        location: "회의실",
        interviewerUserIds: [],
      })
    ).toMatchObject({ interviewerUserIds: [] })
  })

  it("수정 프리필은 주인을 첫 번째로 둔다", () => {
    const slot = {
      interviewers: [
        {
          userId: 12,
          name: "둘",
          email: "two@example.com",
          isHost: false,
          calendarConnected: true,
        },
        {
          userId: 11,
          name: "하나",
          email: "one@example.com",
          isHost: true,
          calendarConnected: true,
        },
      ],
      startAt: "2026-09-10T05:00:00.000Z",
      endAt: "2026-09-10T05:30:00.000Z",
      cohortId: 1,
      cohortPartId: 2,
      capacity: 1,
      location: "회의실",
    } as InterviewSlot
    expect(serializeSlotToForm(slot).interviewerUserIds).toEqual([11, 12])
  })

  it("장소는 면접관이 있을 때만 생략할 수 있다", () => {
    expect(InterviewSlotFormSchema.safeParse(form).success).toBe(true)
    expect(
      InterviewSlotFormSchema.safeParse({ ...form, interviewerUserIds: [] })
        .success
    ).toBe(false)
  })
})

describe("serializeBulkFormToCreatePayloads", () => {
  it("Meet 모드 반복 등록에 면접관과 기본 장소를 넣는다", () => {
    const payloads = serializeBulkFormToCreatePayloads(
      {
        cohortId: 1,
        cohortPartId: 2,
        cohortPartName: CohortPartConfigDtoName.PM,
        date: "2026-09-10",
        rangeStart: "14:00",
        rangeEnd: "14:30",
        durationMinutes: 30,
        excludedStartTimes: [],
        capacity: 1,
        location: "",
        description: "",
        interviewerUserIds: [11, 12],
      },
      [{ startTime: "14:00", endTime: "14:30" }]
    )
    expect(payloads[0]).toMatchObject({
      location: "온라인 (Google Meet)",
      interviewerUserIds: [11, 12],
    })
  })
  it("후보마다 공통 필드를 붙인 생성 페이로드를 만든다", () => {
    const payloads = serializeBulkFormToCreatePayloads(
      {
        cohortId: 1,
        cohortPartId: 2,
        cohortPartName: CohortPartConfigDtoName.PM,
        date: "2026-09-10",
        rangeStart: "14:00",
        rangeEnd: "15:00",
        durationMinutes: 30,
        excludedStartTimes: [],
        capacity: 2,
        location: "  Google Meet ",
        interviewerUserIds: [],
        description: "   ",
      },
      [
        { startTime: "14:00", endTime: "14:30" },
        { startTime: "14:30", endTime: "15:00" },
      ]
    )

    expect(payloads).toEqual([
      {
        cohortId: 1,
        cohortPartId: 2,
        startAt: "2026-09-10T05:00:00.000Z",
        endAt: "2026-09-10T05:30:00.000Z",
        capacity: 2,
        location: "Google Meet",
        description: undefined,
      },
      {
        cohortId: 1,
        cohortPartId: 2,
        startAt: "2026-09-10T05:30:00.000Z",
        endAt: "2026-09-10T06:00:00.000Z",
        capacity: 2,
        location: "Google Meet",
        description: undefined,
      },
    ])
  })
})
