import { getApiClient } from "../client";
import type {
  PostCreateCohortRequest,
  PostCreateCohortResponse,
  GetCohortsResponse,
  GetCohortParams,
  GetCohortResponse,
  PatchUpdateCohortParams,
  PatchUpdateCohortRequest,
  PatchUpdateCohortResponse,
  DeleteCohortParams,
  PutUpdateCohortPartsParams,
  PutUpdateCohortPartsRequest,
  PutUpdateCohortPartsResponse,
  GetActiveCohortResponse,
} from "./types";

const ADMIN_COHORT_BASE_URL = "/api/v1/admin/cohorts" as const;
const PUBLIC_COHORT_BASE_URL = "/api/v1/cohorts" as const;

/** 어드민 기수 API */
export const cohortAPI = {
  /** 새 기수 생성 (POST /api/v1/admin/cohorts) */
  createCohort: ({ payload }: { payload: PostCreateCohortRequest }) =>
    getApiClient().post<PostCreateCohortResponse>(ADMIN_COHORT_BASE_URL, payload),

  /** 기수 전체 목록 조회 (GET /api/v1/admin/cohorts) */
  getCohorts: () => getApiClient().get<GetCohortsResponse>(ADMIN_COHORT_BASE_URL),

  /** 기수 단건 조회 (GET /api/v1/admin/cohorts/{id}) */
  getCohort: ({ params }: { params: GetCohortParams }) =>
    getApiClient().get<GetCohortResponse>(`${ADMIN_COHORT_BASE_URL}/${params.id}`),

  /** 기수 정보 및 상태 수정 (PATCH /api/v1/admin/cohorts/{id}) */
  updateCohort: ({
    params,
    payload,
  }: {
    params: PatchUpdateCohortParams;
    payload: PatchUpdateCohortRequest;
  }) =>
    getApiClient().patch<PatchUpdateCohortResponse>(
      `${ADMIN_COHORT_BASE_URL}/${params.id}`,
      payload,
    ),

  /** 기수 삭제 (DELETE /api/v1/admin/cohorts/{id}) */
  deleteCohort: ({ params }: { params: DeleteCohortParams }) =>
    getApiClient().delete<void>(`${ADMIN_COHORT_BASE_URL}/${params.id}`),

  /** 기수별 파트 모집 설정 (PUT /api/v1/admin/cohorts/{id}/parts) */
  updateCohortParts: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortPartsParams;
    payload: PutUpdateCohortPartsRequest;
  }) =>
    getApiClient().put<PutUpdateCohortPartsResponse>(
      `${ADMIN_COHORT_BASE_URL}/${params.id}/parts`,
      payload,
    ),
};

/** 퍼블릭 기수 API */
export const cohortPublicAPI = {
  /** 현재 활성 기수 조회 (GET /api/v1/cohorts/active) */
  getActiveCohort: () =>
    getApiClient().get<GetActiveCohortResponse>(`${PUBLIC_COHORT_BASE_URL}/active`),
};
