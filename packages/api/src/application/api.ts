import { apiFetch } from "../client";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationsResponse,
  GetAdminApplicationParams,
  GetAdminApplicationResponse,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PatchApplicationStatusResponse,
  PostSaveApplicationDraftRequest,
  PostSaveApplicationDraftResponse,
  PostSubmitApplicationRequest,
  PostSubmitApplicationResponse,
  GetMyApplicationResponse,
} from "./types";

const APPLICATION_BASE_URL = "/api/v1/application" as const;

export const applicationAPI = {
  /**
   * 어드민 지원서 목록 조회
   *
   * @param {GetAdminApplicationsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID (선택)
   * @param {number} [params.cohortPartId] - 파트 ID (선택)
   * @param {ApplicationStatus} [params.status] - 지원 상태 (선택)
   *
   * @returns {Promise<GetAdminApplicationsResponse>} 지원서 목록 응답
   *
   * @example
   * const data = await applicationAPI.getAdminApplications({ params: { cohortId: 1 } })
   */
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));
    if (params.status !== undefined) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return apiFetch<GetAdminApplicationsResponse>(
      `${APPLICATION_BASE_URL}/admin${query ? `?${query}` : ""}`
    );
  },

  /**
   * 어드민 지원서 단일 조회
   *
   * @param {GetAdminApplicationParams} params - 조회 파라미터
   * @param {number} params.id - 지원서 ID
   *
   * @returns {Promise<GetAdminApplicationResponse>} 지원서 상세 응답
   *
   * @example
   * const data = await applicationAPI.getAdminApplication({ params: { id: 1 } })
   */
  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    apiFetch<GetAdminApplicationResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}`
    ),

  /**
   * 지원서 상태 변경
   *
   * @param {Object} args - 함수 인자
   * @param {PatchApplicationStatusParams} args.params - 지원서 파라미터
   * @param {number} args.params.id - 지원서 ID
   * @param {PatchApplicationStatusRequest} args.payload - 상태 변경 데이터
   * @param {ApplicationStatusUpdate} args.payload.status - 변경할 상태
   *
   * @returns {Promise<PatchApplicationStatusResponse>} 상태 변경된 지원서 응답
   *
   * @example
   * const data = await applicationAPI.patchApplicationStatus({
   *   params: { id: 1 },
   *   payload: { status: '서류합격' }
   * })
   */
  patchApplicationStatus: ({
    params,
    payload,
  }: {
    params: PatchApplicationStatusParams;
    payload: PatchApplicationStatusRequest;
  }) =>
    apiFetch<PatchApplicationStatusResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 지원서 임시 저장
   *
   * @param {PostSaveApplicationDraftRequest} payload - 임시 저장 데이터
   * @param {number} payload.cohortPartId - 파트 ID
   * @param {Record<string, unknown>} payload.answers - 답변 JSON
   *
   * @returns {Promise<PostSaveApplicationDraftResponse>} 임시 저장된 지원서 응답
   *
   * @example
   * const data = await applicationAPI.saveApplicationDraft({
   *   payload: { cohortPartId: 1, answers: {} }
   * })
   */
  saveApplicationDraft: ({
    payload,
  }: {
    payload: PostSaveApplicationDraftRequest;
  }) =>
    apiFetch<PostSaveApplicationDraftResponse>(
      `${APPLICATION_BASE_URL}/draft`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 지원서 제출
   *
   * @param {PostSubmitApplicationRequest} payload - 지원서 제출 데이터
   * @param {number} payload.cohortPartId - 파트 ID
   * @param {string} payload.applicantName - 지원자 이름
   * @param {string} payload.applicantPhone - 지원자 연락처 (01X-XXXX-XXXX 형식)
   * @param {string} [payload.applicantBirthDate] - 지원자 생년월일 (선택)
   * @param {string} [payload.applicantRegion] - 지원자 거주 지역 (선택)
   * @param {Record<string, unknown>} payload.answers - 답변 JSON
   * @param {boolean} payload.privacyAgreed - 개인정보 수집 동의 여부
   *
   * @returns {Promise<PostSubmitApplicationResponse>} 제출된 지원서 응답
   *
   * @example
   * const data = await applicationAPI.submitApplication({
   *   payload: { cohortPartId: 1, applicantName: '홍길동', applicantPhone: '010-1234-5678', answers: {}, privacyAgreed: true }
   * })
   */
  submitApplication: ({
    payload,
  }: {
    payload: PostSubmitApplicationRequest;
  }) =>
    apiFetch<PostSubmitApplicationResponse>(
      `${APPLICATION_BASE_URL}/submit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 내 지원서 조회
   *
   * @returns {Promise<GetMyApplicationResponse>} 내 지원서 응답
   *
   * @example
   * const data = await applicationAPI.getMyApplication()
   */
  getMyApplication: () =>
    apiFetch<GetMyApplicationResponse>(`${APPLICATION_BASE_URL}/my`),
};
