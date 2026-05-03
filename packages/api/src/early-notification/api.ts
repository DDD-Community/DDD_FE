import {
  earlyNotificationGetAdminList,
  earlyNotificationSendBulk,
} from "../generated/admin-early-notification/admin-early-notification";
import { earlyNotificationSubscribe } from "../generated/early-notification/early-notification";
import { apiFetch } from "../mutator";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsResponse,
  GetAdminEarlyNotificationsCsvParams,
  GetAdminEarlyNotificationsCsvResponse,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
  PostSubscribeEarlyNotificationResponse,
} from "./types";

export const earlyNotificationAPI = {
  /** 기수별 사전 알림 신청 목록을 조회합니다. */
  getAdminEarlyNotifications: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsParams;
  }) =>
    earlyNotificationGetAdminList(params) as unknown as Promise<GetAdminEarlyNotificationsResponse>,

  /**
   * 기수별 사전 알림 신청 목록을 CSV 텍스트로 내보냅니다.
   *
   * NOTE: orval generated 함수는 responseType 을 전달하지 않아 JSON 파서를 거치므로
   * 여기서는 apiFetch 를 직접 호출하면서 responseType: "text" 를 명시한다.
   */
  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }): Promise<GetAdminEarlyNotificationsCsvResponse> =>
    apiFetch<string>({
      url: "/api/v1/admin/early-notifications/export",
      method: "GET",
      params: params as unknown as Record<string, unknown>,
      responseType: "text",
    }),

  /** 기수별 미발송 대상에게 사전 알림 이메일을 일괄 발송합니다. */
  sendBulkEarlyNotification: ({
    payload,
  }: {
    payload: PostSendBulkEarlyNotificationRequest;
  }) => earlyNotificationSendBulk(payload),

  /** 기수별 사전 알림 이메일을 등록합니다. */
  subscribeEarlyNotification: ({
    payload,
  }: {
    payload: PostSubscribeEarlyNotificationRequest;
  }) =>
    earlyNotificationSubscribe(payload) as Promise<PostSubscribeEarlyNotificationResponse>,
};
