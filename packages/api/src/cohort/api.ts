import { getApiClient } from "../client";
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
  createCohort: ({ payload }: { payload: PostCreateCohortRequest }) =>
    getApiClient().post<PostCreateCohortResponse>(COHORT_BASE_URL, payload),

  getCohorts: () => getApiClient().get<GetCohortsResponse>(COHORT_BASE_URL),

  getCohort: ({ params }: { params: GetCohortParams }) =>
    getApiClient().get<GetCohortResponse>(`${COHORT_BASE_URL}/${params.id}`),

  updateCohort: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortParams;
    payload: PutUpdateCohortRequest;
  }) =>
    getApiClient().put<PutUpdateCohortResponse>(
      `${COHORT_BASE_URL}/${params.id}`,
      payload,
    ),

  deleteCohort: ({ params }: { params: DeleteCohortParams }) =>
    getApiClient().delete<void>(`${COHORT_BASE_URL}/${params.id}`),

  updateCohortParts: ({
    params,
    payload,
  }: {
    params: PutUpdateCohortPartsParams;
    payload: PutUpdateCohortPartsRequest;
  }) =>
    getApiClient().put<PutUpdateCohortPartsResponse>(
      `${COHORT_BASE_URL}/${params.id}/parts`,
      payload,
    ),
};
