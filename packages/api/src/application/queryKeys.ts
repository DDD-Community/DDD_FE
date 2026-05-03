import type {
  GetAdminApplicationsParams,
  GetAdminApplicationParams,
  GetApplicationDraftParams,
} from "./types";

export const applicationKeys = {
  /** 지원서 base key */
  all: ["applications"] as const,

  /** 어드민 지원서 목록 key */
  adminLists: () => [...applicationKeys.all, "admin", "list"] as const,

  /**
   * 어드민 지원서 목록 필터 key
   *
   * @param {GetAdminApplicationsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID (선택)
   * @param {number} [params.cohortPartId] - 파트 ID (선택)
   * @param {ApplicationStatus} [params.status] - 지원 상태 (선택)
   */
  adminList: (params: GetAdminApplicationsParams) =>
    [...applicationKeys.adminLists(), params] as const,

  /**
   * 어드민 지원서 단일 조회 key
   *
   * @param {GetAdminApplicationParams} params - 조회 파라미터
   * @param {number} params.id - 지원서 ID
   */
  adminDetail: (params: GetAdminApplicationParams) =>
    [...applicationKeys.all, "admin", "detail", params] as const,

  /** 임시저장 목록 base key */
  drafts: () => [...applicationKeys.all, "draft"] as const,

  /**
   * 파트별 임시저장 단건 key
   *
   * @param {GetApplicationDraftParams} params - 조회 파라미터
   * @param {number} params.cohortPartId - 파트 ID
   */
  draft: (params: GetApplicationDraftParams) =>
    [...applicationKeys.drafts(), params] as const,
};
