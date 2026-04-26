import { apiFetch } from "../client";
import type {
  PostCreateCohortRequest,
  PostCreateCohortResponse,
  GetCohortsResponse,
  GetCohortParams,
  GetCohortResponse,
  PutUpdateCohortParams,
  PutUpdateCohortRequest,
  PutUpdateCohortResponse,
  DeleteCohortParams,
  PutUpdateCohortPartsParams,
  PutUpdateCohortPartsRequest,
  PutUpdateCohortPartsResponse,
} from "./types";

const COHORT_BASE_URL = "/api/v1/cohorts" as const;

export const cohortAPI = {
  /**
   * 기수 생성
   *
   * @param {PostCreateCohortRequest} payload - 기수 생성 데이터
   * @param {string} payload.name - 기수 명칭
   * @param {string} payload.recruitStartAt - 모집 시작일
   * @param {string} payload.recruitEndAt - 모집 종료일
   * @param {CohortStatus} [payload.status] - 기수 상태 (선택)
   * @param {Record<string, unknown>} [payload.process] - 프로세스 일정 JSON (선택)
   * @param {Record<string, unknown>[]} [payload.curriculum] - 커리큘럼 배열 JSON (선택)
   * @param {Record<string, unknown>} [payload.applicationForm] - 파트별 지원서 양식 JSON (선택)
   * @param {CohortPartConfig[]} [payload.parts] - 파트별 모집 설정 (선택)
   *
   * @returns {Promise<PostCreateCohortResponse>} 생성된 기수 응답
   *
   * @example
   * const data = await cohortAPI.createCohort({
   *   payload: { name: '14기', recruitStartAt: '2024-01-01', recruitEndAt: '2024-01-31' }
   * })
   */
  createCohort: ({ payload }: { payload: PostCreateCohortRequest }) =>
    apiFetch<PostCreateCohortResponse>(COHORT_BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 기수 목록 조회
   *
   * @returns {Promise<GetCohortsResponse>} 기수 목록 응답
   *
   * @example
   * const data = await cohortAPI.getCohorts()
   */
  getCohorts: () => apiFetch<GetCohortsResponse>(COHORT_BASE_URL),

  /**
   * 기수 단일 조회
   *
   * @param {GetCohortParams} params - 조회 파라미터
   * @param {number} params.id - 기수 ID
   *
   * @returns {Promise<GetCohortResponse>} 기수 상세 응답
   *
   * @example
   * const data = await cohortAPI.getCohort({ params: { id: 1 } })
   */
  getCohort: ({ params }: { params: GetCohortParams }) =>
    apiFetch<GetCohortResponse>(`${COHORT_BASE_URL}/${params.id}`),

  /**
   * 기수 수정
   *
   * @param {Object} args - 함수 인자
   * @param {PutUpdateCohortParams} args.params - 수정할 기수 파라미터
   * @param {number} args.params.id - 기수 ID
   * @param {PutUpdateCohortRequest} args.payload - 기수 수정 데이터
   * @param {string} [args.payload.name] - 기수 명칭 (선택)
   * @param {string} [args.payload.recruitStartAt] - 모집 시작일 (선택)
   * @param {string} [args.payload.recruitEndAt] - 모집 종료일 (선택)
   * @param {UpdateCohortStatus} [args.payload.status] - 기수 상태 (선택)
   *
   * @returns {Promise<PutUpdateCohortResponse>} 수정된 기수 응답
   *
   * @example
   * const data = await cohortAPI.updateCohort({
   *   params: { id: 1 },
   *   payload: { name: '14기 (수정)' }
   * })
   */
  updateCohort: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortParams;
    payload: PutUpdateCohortRequest;
  }) =>
    apiFetch<PutUpdateCohortResponse>(`${COHORT_BASE_URL}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /**
   * 기수 삭제
   *
   * @param {DeleteCohortParams} params - 삭제할 기수 파라미터
   * @param {number} params.id - 기수 ID
   *
   * @returns {Promise<void>}
   *
   * @example
   * await cohortAPI.deleteCohort({ params: { id: 1 } })
   */
  deleteCohort: ({ params }: { params: DeleteCohortParams }) =>
    apiFetch<void>(`${COHORT_BASE_URL}/${params.id}`, {
      method: "DELETE",
    }),

  /**
   * 기수 파트 설정 수정
   *
   * @param {Object} args - 함수 인자
   * @param {PutUpdateCohortPartsParams} args.params - 기수 파라미터
   * @param {number} args.params.id - 기수 ID
   * @param {PutUpdateCohortPartsRequest} args.payload - 파트 설정 데이터
   * @param {CohortPartConfig[]} args.payload.parts - 파트별 모집 설정 목록 (최소 1개)
   *
   * @returns {Promise<PutUpdateCohortPartsResponse>} 수정된 기수 응답
   *
   * @example
   * const data = await cohortAPI.updateCohortParts({
   *   params: { id: 1 },
   *   payload: { parts: [{ name: 'FE', isOpen: true, formSchema: {} }] }
   * })
   */
  updateCohortParts: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortPartsParams;
    payload: PutUpdateCohortPartsRequest;
  }) =>
    apiFetch<PutUpdateCohortPartsResponse>(
      `${COHORT_BASE_URL}/${params.id}/parts`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),
};
