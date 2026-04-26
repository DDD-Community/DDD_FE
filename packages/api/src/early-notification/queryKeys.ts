import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsCsvParams,
} from "./types";

export const earlyNotificationKeys = {
  /** 사전 알림 base key */
  all: ["earlyNotifications"] as const,

  /** 어드민 사전 알림 목록 key */
  adminLists: () => [...earlyNotificationKeys.all, "admin", "list"] as const,

  /**
   * 어드민 사전 알림 목록 필터 key
   *
   * @param {GetAdminEarlyNotificationsParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID
   * @param {boolean} [params.onlyUnnotified] - 미발송 대상만 조회 (선택)
   */
  adminList: (params: GetAdminEarlyNotificationsParams) =>
    [...earlyNotificationKeys.adminLists(), params] as const,

  /**
   * 어드민 사전 알림 CSV key
   *
   * @param {GetAdminEarlyNotificationsCsvParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID
   */
  adminCsv: (params: GetAdminEarlyNotificationsCsvParams) =>
    [...earlyNotificationKeys.all, "admin", "csv", params] as const,
};
