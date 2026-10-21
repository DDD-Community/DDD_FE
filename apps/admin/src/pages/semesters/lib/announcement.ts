import type { AnnouncementInfo } from "../types"

/**
 * 기수 process jsonb 에서 지원자 안내 메일 값을 읽고 쓴다.
 *
 * 메일 값과 일정 값은 같은 process 에 들어 있지만 폼에서는 따로 다룬다.
 * 일정 폼(ProcessSection)만 process 를 채우면 저장할 때마다 메일 값이 빠져 사라졌기 때문이다.
 */

export const EMPTY_ANNOUNCEMENT: AnnouncementInfo = {
  interviewDurationMinutes: "",
  interviewRescheduleDeadline: "",
  participationFee: "",
  participationFeeDetail: "",
  bankAccount: "",
  accountHolder: "",
  participationConfirmDeadline: "",
}

const ANNOUNCEMENT_KEYS = Object.keys(EMPTY_ANNOUNCEMENT) as Array<
  keyof AnnouncementInfo
>

/** BE 가 숫자로 읽는 키. 나머지는 문자열 그대로 둔다 */
const NUMBER_KEYS: ReadonlySet<keyof AnnouncementInfo> = new Set([
  "interviewDurationMinutes",
  "participationFee",
])

/** jsonb 에는 숫자로도 문자열로도 들어올 수 있다 (SQL 로 넣은 값 등) */
const toFormText = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string") return value
  return ""
}

export const extractAnnouncement = (raw: unknown): AnnouncementInfo => {
  if (typeof raw !== "object" || raw === null) return { ...EMPTY_ANNOUNCEMENT }
  const o = raw as Record<string, unknown>
  return Object.fromEntries(
    ANNOUNCEMENT_KEYS.map((key) => [key, toFormText(o[key])])
  ) as AnnouncementInfo
}

/** "160,000" → 160000. 양수가 아니면 null — BE 도 같은 값을 없음으로 본다 */
const toPositiveNumber = (text: string): number | null => {
  const parsed = Number(text.replaceAll(",", "").trim())
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/**
 * 폼 값 → process 에 합칠 키. 비운 칸은 null 로 보내 서버의 기존 값을 지운다.
 * (서버는 process 를 보낸 키만 병합하므로, 키를 빼고 보내면 옛 값이 남는다)
 */
export const toAnnouncementProcess = (
  announcement: AnnouncementInfo
): Record<keyof AnnouncementInfo, string | number | null> =>
  Object.fromEntries(
    ANNOUNCEMENT_KEYS.map((key) => {
      const text = announcement[key].trim()
      if (text === "") return [key, null]
      return [key, NUMBER_KEYS.has(key) ? toPositiveNumber(text) : text]
    })
  ) as Record<keyof AnnouncementInfo, string | number | null>
