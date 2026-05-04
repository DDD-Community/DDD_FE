/** 사전 알림 상태 라벨 — `notifiedAt` 유무로 derive */
export const STATUS_LABEL = {
  pending: "대기",
  notified: "발송 완료",
} as const

export type ReminderStatusKey = keyof typeof STATUS_LABEL

/** 상태 필터 — Select 옵션 */
export const STATUS_FILTER_OPTIONS = ["전체", "대기", "발송 완료"] as const
export type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number]

/** 필터값을 `notifiedAt` 기준 술어로 매핑 */
export const STATUS_FILTER_PREDICATE: Record<
  StatusFilterOption,
  ((notifiedAt?: string) => boolean) | null
> = {
  전체: null,
  대기: (notifiedAt) => !notifiedAt,
  "발송 완료": (notifiedAt) => !!notifiedAt,
}
