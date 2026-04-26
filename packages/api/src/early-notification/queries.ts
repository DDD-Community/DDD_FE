import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { earlyNotificationAPI } from "./api";
import { earlyNotificationKeys } from "./queryKeys";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsCsvParams,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
} from "./types";

export const earlyNotificationQueries = {
  /**
   * 어드민 사전 알림 목록 조회 쿼리
   *
   * @param {GetAdminEarlyNotificationsParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID
   * @param {boolean} [params.onlyUnnotified] - 미발송 대상만 조회 (선택)
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(earlyNotificationQueries.getAdminEarlyNotifications({ params: { cohortId: 1 } }))
   */
  getAdminEarlyNotifications: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsParams;
  }) =>
    queryOptions({
      queryKey: earlyNotificationKeys.adminList(params),
      queryFn: () => earlyNotificationAPI.getAdminEarlyNotifications({ params }),
      enabled: !!params.cohortId,
    }),

  /**
   * 어드민 사전 알림 CSV 조회 쿼리
   *
   * @param {GetAdminEarlyNotificationsCsvParams} params - 조회 파라미터
   * @param {number} params.cohortId - 기수 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(earlyNotificationQueries.getAdminEarlyNotificationsCsv({ params: { cohortId: 1 } }))
   */
  getAdminEarlyNotificationsCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }) =>
    queryOptions({
      queryKey: earlyNotificationKeys.adminCsv(params),
      queryFn: () => earlyNotificationAPI.exportAdminCsv({ params }),
      enabled: !!params.cohortId,
    }),
};

export const earlyNotificationMutations = {
  /**
   * 사전 알림 일괄 발송 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(earlyNotificationMutations.sendBulkEarlyNotification())
   * mutation.mutate({ payload: { cohortId: 1, subject: '...', html: '...', text: '...' } })
   */
  sendBulkEarlyNotification: () =>
    mutationOptions({
      mutationFn: ({
        payload,
      }: {
        payload: PostSendBulkEarlyNotificationRequest;
      }) => earlyNotificationAPI.sendBulkEarlyNotification({ payload }),
    }),

  /**
   * 사전 알림 구독 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(earlyNotificationMutations.subscribeEarlyNotification())
   * mutation.mutate({ payload: { cohortId: 1, email: 'user@example.com' } })
   */
  subscribeEarlyNotification: () =>
    mutationOptions({
      mutationFn: ({
        payload,
      }: {
        payload: PostSubscribeEarlyNotificationRequest;
      }) => earlyNotificationAPI.subscribeEarlyNotification({ payload }),
    }),
};
