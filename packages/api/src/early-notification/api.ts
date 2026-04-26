import { apiFetch } from "../client";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsResponse,
  GetAdminEarlyNotificationsCsvParams,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
  PostSubscribeEarlyNotificationResponse,
} from "./types";

const EARLY_NOTIFICATION_BASE_URL = "/api/v1/early-notifications" as const;

export const earlyNotificationAPI = {
  /**
   * 어드민 사전 알림 목록 조회
   *
   * @param {GetAdminEarlyNotificationsParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID (최소값: 1)
   * @param {boolean} [params.onlyUnnotified] - 미발송 대상만 조회 (선택)
   *
   * @returns {Promise<GetAdminEarlyNotificationsResponse>} 사전 알림 목록 응답
   *
   * @example
   * const data = await earlyNotificationAPI.getAdminEarlyNotifications({ params: { cohortId: 1 } })
   */
  getAdminEarlyNotifications: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsParams;
  }) => {
    const searchParams = new URLSearchParams({
      cohortId: String(params.cohortId),
    });
    if (params.onlyUnnotified !== undefined)
      searchParams.set("onlyUnnotified", String(params.onlyUnnotified));

    return apiFetch<GetAdminEarlyNotificationsResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin?${searchParams}`
    );
  },

  /**
   * 사전 알림 CSV 내보내기
   *
   * @param {GetAdminEarlyNotificationsCsvParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID (최소값: 1)
   *
   * @returns {Promise<Blob>} CSV 파일 Blob
   *
   * @example
   * const csvBlob = await earlyNotificationAPI.exportAdminCsv({ params: { cohortId: 1 } })
   */
  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }) => {
    const searchParams = new URLSearchParams({
      cohortId: String(params.cohortId),
    });

    return apiFetch<Blob>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin/export/csv?${searchParams}`
    );
  },

  /**
   * 사전 알림 일괄 발송
   *
   * @param {PostSendBulkEarlyNotificationRequest} payload - 발송 데이터
   * @param {number} payload.cohortId - 기수 ID (최소값: 1)
   * @param {string} payload.subject - 이메일 제목 (최대 200자)
   * @param {string} payload.html - HTML 본문 (최대 50000자)
   * @param {string} payload.text - 텍스트 본문 (최대 50000자)
   *
   * @returns {Promise<void>}
   *
   * @example
   * await earlyNotificationAPI.sendBulkEarlyNotification({
   *   payload: { cohortId: 1, subject: '14기 모집 안내', html: '<h1>...</h1>', text: '...' }
   * })
   */
  sendBulkEarlyNotification: ({
    payload,
  }: {
    payload: PostSendBulkEarlyNotificationRequest;
  }) =>
    apiFetch<void>(`${EARLY_NOTIFICATION_BASE_URL}/admin/send`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 사전 알림 구독
   *
   * @param {PostSubscribeEarlyNotificationRequest} payload - 구독 데이터
   * @param {number} payload.cohortId - 기수 ID (최소값: 1)
   * @param {string} payload.email - 이메일 주소 (최대 254자)
   *
   * @returns {Promise<PostSubscribeEarlyNotificationResponse>} 구독된 사전 알림 응답
   *
   * @example
   * const data = await earlyNotificationAPI.subscribeEarlyNotification({
   *   payload: { cohortId: 1, email: 'user@example.com' }
   * })
   */
  subscribeEarlyNotification: ({
    payload,
  }: {
    payload: PostSubscribeEarlyNotificationRequest;
  }) =>
    apiFetch<PostSubscribeEarlyNotificationResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/subscribe`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};
