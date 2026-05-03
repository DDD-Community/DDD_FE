import type {
  SubscribeEarlyNotificationRequestDto,
  SendBulkEarlyNotificationRequestDto,
  EarlyNotificationGetAdminListParams,
  EarlyNotificationExportAdminCsvParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/admin/early-notifications - 어드민 사전 알림 목록 조회
export type GetAdminEarlyNotificationsParams = EarlyNotificationGetAdminListParams;
export type GetAdminEarlyNotificationsResponse = EarlyNotificationDto[];

// GET /api/v1/admin/early-notifications/export - 사전 알림 CSV 내보내기
export type GetAdminEarlyNotificationsCsvParams = EarlyNotificationExportAdminCsvParams;
export type GetAdminEarlyNotificationsCsvResponse = string;

// POST /api/v1/admin/early-notifications/send - 사전 알림 일괄 발송
export type PostSendBulkEarlyNotificationRequest = SendBulkEarlyNotificationRequestDto;
export type PostSendBulkEarlyNotificationResponse = void;

// POST /api/v1/early-notifications - 사전 알림 구독
export type PostSubscribeEarlyNotificationRequest = SubscribeEarlyNotificationRequestDto;
export type PostSubscribeEarlyNotificationResponse = void;

// 엔티티 타입
export interface EarlyNotificationDto {
  id: number;
  cohortId: number;
  email: string;
  notifiedAt?: string;
  createdAt: string;
}
