import { getApiClient } from "../client";
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

    return getApiClient().get<GetAdminEarlyNotificationsResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin?${searchParams}`,
    );
  },

  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }) => {
    const searchParams = new URLSearchParams({
      cohortId: String(params.cohortId),
    });

    return getApiClient().get<Blob>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin/export/csv?${searchParams}`,
      { responseType: "blob" },
    );
  },

  sendBulkEarlyNotification: ({
    payload,
  }: {
    payload: PostSendBulkEarlyNotificationRequest;
  }) =>
    getApiClient().post<void>(
      `${EARLY_NOTIFICATION_BASE_URL}/admin/send`,
      payload,
    ),

  subscribeEarlyNotification: ({
    payload,
  }: {
    payload: PostSubscribeEarlyNotificationRequest;
  }) =>
    getApiClient().post<PostSubscribeEarlyNotificationResponse>(
      `${EARLY_NOTIFICATION_BASE_URL}/subscribe`,
      payload,
    ),
};
