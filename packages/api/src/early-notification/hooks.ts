import { useQuery, useMutation } from "@tanstack/react-query";
import { earlyNotificationQueries, earlyNotificationMutations } from "./queries";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsCsvParams,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
} from "./types";

/**
 * 어드민 사전 알림 목록 조회 훅
 *
 * @param {GetAdminEarlyNotificationsParams} params - 조회 파라미터
 * @param {number} params.cohortId - 기수 ID
 * @param {boolean} [params.onlyUnnotified] - 미발송 대상만 조회 (선택)
 *
 * @example
 * const { data: notifications, isLoading } = useAdminEarlyNotifications({ params: { cohortId: 1 } })
 */
export const useAdminEarlyNotifications = ({
  params,
}: {
  params: GetAdminEarlyNotificationsParams;
}) => useQuery(earlyNotificationQueries.getAdminEarlyNotifications({ params }));

/**
 * 어드민 사전 알림 CSV 조회 훅
 *
 * @param {GetAdminEarlyNotificationsCsvParams} params - 조회 파라미터
 * @param {number} params.cohortId - 기수 ID
 *
 * @example
 * const { data: csvBlob, isLoading } = useAdminEarlyNotificationsCsv({ params: { cohortId: 1 } })
 */
export const useAdminEarlyNotificationsCsv = ({
  params,
}: {
  params: GetAdminEarlyNotificationsCsvParams;
}) =>
  useQuery(earlyNotificationQueries.getAdminEarlyNotificationsCsv({ params }));

/**
 * 사전 알림 일괄 발송 훅
 *
 * @example
 * const { mutate: sendBulk, isPending } = useSendBulkEarlyNotification()
 * sendBulk({ payload: { cohortId: 1, subject: '...', html: '...', text: '...' } })
 */
export const useSendBulkEarlyNotification = () =>
  useMutation(earlyNotificationMutations.sendBulkEarlyNotification());

/**
 * 사전 알림 구독 훅
 *
 * @example
 * const { mutate: subscribe, isPending } = useSubscribeEarlyNotification()
 * subscribe({ payload: { cohortId: 1, email: 'user@example.com' } })
 */
export const useSubscribeEarlyNotification = () =>
  useMutation(earlyNotificationMutations.subscribeEarlyNotification());
