import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { applicationAPI } from "./api";
import { applicationKeys } from "./queryKeys";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationParams,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PostSaveApplicationDraftRequest,
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
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(applicationQueries.getAdminApplications({ params: { cohortId: 1 } }))
   */
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) =>
    queryOptions({
      queryKey: applicationKeys.adminList(params),
      queryFn: () => applicationAPI.getAdminApplications({ params }),
    }),

  /**
   * 어드민 지원서 단일 조회 쿼리
   *
   * @param {GetAdminApplicationParams} params - 조회 파라미터
   * @param {number} params.id - 지원서 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(applicationQueries.getAdminApplication({ params: { id: 1 } }))
   */
  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    queryOptions({
      queryKey: applicationKeys.adminDetail(params),
      queryFn: () => applicationAPI.getAdminApplication({ params }),
      enabled: !!params.id,
    }),

  /**
   * 내 지원서 조회 쿼리
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(applicationQueries.getMyApplication())
   */
  getMyApplication: () =>
    queryOptions({
      queryKey: applicationKeys.my(),
      queryFn: () => applicationAPI.getMyApplication(),
    }),
};

export const applicationMutations = {
  /**
   * 지원서 상태 변경 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
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
   * 지원서 임시 저장 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
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
   * 지원서 제출 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
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
