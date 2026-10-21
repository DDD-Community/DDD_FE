import { describe, expect, it } from "vitest"

import {
  EMPTY_ANNOUNCEMENT,
  extractAnnouncement,
  toAnnouncementProcess,
} from "./announcement"

describe("extractAnnouncement", () => {
  it("process 의 메일 값을 폼 문자열로 읽는다 (숫자는 문자열로)", () => {
    const announcement = extractAnnouncement({
      documentResultDate: "2026-10-07",
      participationFee: 160000,
      participationFeeDetail: "운영비 8만원 + 노쇼비 8만원",
      bankAccount: "토스뱅크 1000-0000-0000",
      accountHolder: "홍길동",
      participationConfirmDeadline: "메일 수신 기준으로 다음날 오후 12시",
      interviewDurationMinutes: "30",
    })

    expect(announcement).toEqual({
      interviewDurationMinutes: "30",
      interviewRescheduleDeadline: "",
      participationFee: "160000",
      participationFeeDetail: "운영비 8만원 + 노쇼비 8만원",
      bankAccount: "토스뱅크 1000-0000-0000",
      accountHolder: "홍길동",
      participationConfirmDeadline: "메일 수신 기준으로 다음날 오후 12시",
    })
  })

  it("process 가 없거나 null 값이면 빈 칸이다", () => {
    expect(extractAnnouncement(null)).toEqual(EMPTY_ANNOUNCEMENT)
    expect(extractAnnouncement({ bankAccount: null }).bankAccount).toBe("")
  })
})

describe("toAnnouncementProcess", () => {
  it("숫자 키는 숫자로, 나머지는 문자열로 보낸다", () => {
    const process = toAnnouncementProcess({
      ...EMPTY_ANNOUNCEMENT,
      participationFee: "160,000",
      interviewDurationMinutes: " 30 ",
      accountHolder: " 홍길동 ",
    })

    expect(process.participationFee).toBe(160000)
    expect(process.interviewDurationMinutes).toBe(30)
    expect(process.accountHolder).toBe("홍길동")
  })

  it("비운 칸과 양수가 아닌 숫자는 null 로 보내 서버의 옛 값을 지운다", () => {
    const process = toAnnouncementProcess({
      ...EMPTY_ANNOUNCEMENT,
      participationFee: "0",
    })

    expect(process.participationFee).toBeNull()
    expect(process.bankAccount).toBeNull()
    expect(Object.keys(process).sort()).toEqual(
      Object.keys(EMPTY_ANNOUNCEMENT).sort()
    )
  })
})
