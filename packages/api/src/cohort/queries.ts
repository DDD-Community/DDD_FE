import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { cohortAPI } from "./api";
import { cohortKeys } from "./queryKeys";
import type {
  GetCohortParams,
  PutUpdateCohortParams,
  PutUpdateCohortRequest,
  DeleteCohortParams,
  PostCreateCohortRequest,
  PutUpdateCohortPartsParams,
  PutUpdateCohortPartsRequest,
} from "./types";

export const cohortQueries = {
  /**
   * 기수 목록 조회 쿼리
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const cohortsQuery = useQuery(cohortQueries.getCohorts())
   */
  getCohorts: () =>
    queryOptions({
      queryKey: cohortKeys.lists(),
      queryFn: () => cohortAPI.getCohorts(),
    }),

  /**
   * 기수 단일 조회 쿼리
   *
   * @param {GetCohortParams} params - 조회 파라미터
   * @param {number} params.id - 기수 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const cohortQuery = useQuery(cohortQueries.getCohort({ params: { id: 1 } }))
   */
  getCohort: ({ params }: { params: GetCohortParams }) =>
    queryOptions({
      queryKey: cohortKeys.detail(params),
      queryFn: () => cohortAPI.getCohort({ params }),
      enabled: !!params.id,
    }),
};

export const cohortMutations = {
  /**
   * 기수 생성 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const createMutation = useMutation(cohortMutations.createCohort())
   * createMutation.mutate({ payload: { name: '14기', recruitStartAt: '2024-01-01', recruitEndAt: '2024-01-31' } })
   */
  createCohort: () =>
    mutationOptions({
      mutationFn: cohortAPI.createCohort,
    }),

  /**
   * 기수 수정 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const updateMutation = useMutation(cohortMutations.updateCohort())
   * updateMutation.mutate({ params: { id: 1 }, payload: { name: '14기 (수정)' } })
   */
  updateCohort: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PutUpdateCohortParams;
        payload: PutUpdateCohortRequest;
      }) => cohortAPI.updateCohort({ params, payload }),
    }),

  /**
   * 기수 삭제 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const deleteMutation = useMutation(cohortMutations.deleteCohort())
   * deleteMutation.mutate({ params: { id: 1 } })
   */
  deleteCohort: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteCohortParams }) =>
        cohortAPI.deleteCohort({ params }),
    }),

  /**
   * 기수 파트 설정 수정 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const updatePartsMutation = useMutation(cohortMutations.updateCohortParts())
   * updatePartsMutation.mutate({ params: { id: 1 }, payload: { parts: [...] } })
   */
  updateCohortParts: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PutUpdateCohortPartsParams;
        payload: PutUpdateCohortPartsRequest;
      }) => cohortAPI.updateCohortParts({ params, payload }),
    }),
};
