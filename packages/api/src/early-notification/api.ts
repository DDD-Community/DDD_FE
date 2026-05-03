import {
  earlyNotificationGetAdminList,
  earlyNotificationExportAdminCsv,
  earlyNotificationSendBulk,
} from "../generated/admin-early-notification/admin-early-notification";
import { earlyNotificationSubscribe } from "../generated/early-notification/early-notification";
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

  /** 기수별 사전 알림 신청 목록을 CSV 파일로 내보냅니다. */
  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }) =>
    earlyNotificationExportAdminCsv(params) as Promise<GetAdminEarlyNotificationsCsvResponse>,

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
