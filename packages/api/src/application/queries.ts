import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { applicationAPI } from "./api";
import { applicationKeys } from "./queryKeys";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationParams,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PostSaveApplicationDraftRequest,
  GetApplicationDraftParams,
  PostSubmitApplicationRequest,
} from "./types";

export const applicationQueries = {
  /**
   * 어드민 지원서 목록 조회 쿼리
   *
   * @param {GetAdminApplicationsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID (선택)
   * @param {number} [params.cohortPartId] - 파트 ID (선택)
   * @param {ApplicationStatus} [params.status] - 지원 상태 (선택)
   */
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) =>
    queryOptions({
      queryKey: applicationKeys.adminList(params),
      queryFn: () => applicationAPI.getAdminApplications({ params }),
    }),

  /**
   * 어드민 지원서 단건 상세 조회 쿼리
   *
   * @param {GetAdminApplicationParams} params - 조회 파라미터
   * @param {number} params.id - 지원서 ID
   */
  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    queryOptions({
      queryKey: applicationKeys.adminDetail(params),
      queryFn: () => applicationAPI.getAdminApplication({ params }),
      enabled: !!params.id,
    }),

  /**
   * 파트별 임시저장 단건 조회 쿼리
   *
   * @param {GetApplicationDraftParams} params - 조회 파라미터
   * @param {number} params.cohortPartId - 파트 ID
   */
  getApplicationDraft: ({ params }: { params: GetApplicationDraftParams }) =>
    queryOptions({
      queryKey: applicationKeys.draft(params),
      queryFn: () => applicationAPI.getApplicationDraft({ params }),
      enabled: Number.isFinite(params.cohortPartId),
    }),
};

export const applicationMutations = {
  /**
   * 어드민 지원서 상태 변경 mutation
   *
   * @example
   * const mutation = useMutation(applicationMutations.patchApplicationStatus())
   * mutation.mutate({ params: { id: 1 }, payload: { status: '서류합격' } })
   */
  patchApplicationStatus: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PatchApplicationStatusParams;
        payload: PatchApplicationStatusRequest;
      }) => applicationAPI.patchApplicationStatus({ params, payload }),
    }),

  /**
   * 지원서 임시저장 mutation
   *
   * @example
   * const mutation = useMutation(applicationMutations.saveApplicationDraft())
   * mutation.mutate({ payload: { cohortPartId: 1, answers: {} } })
   */
  saveApplicationDraft: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostSaveApplicationDraftRequest }) =>
        applicationAPI.saveApplicationDraft({ payload }),
    }),

  /**
   * 지원서 최종 제출 mutation
   *
   * @example
   * const mutation = useMutation(applicationMutations.submitApplication())
   * mutation.mutate({ payload: { cohortPartId: 1, applicantName: '홍길동', ... } })
   */
  submitApplication: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostSubmitApplicationRequest }) =>
        applicationAPI.submitApplication({ payload }),
    }),
};
