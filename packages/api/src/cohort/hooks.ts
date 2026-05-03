import { useQuery, useMutation } from "@tanstack/react-query";
import { cohortQueries, cohortMutations, cohortPublicQueries } from "./queries";
import type {
  GetCohortParams,
  PatchUpdateCohortParams,
  PatchUpdateCohortRequest,
  DeleteCohortParams,
  PutUpdateCohortPartsParams,
  PutUpdateCohortPartsRequest,
} from "./types";

/**
 * 기수 목록 조회 훅
 *
 * @example
 * const { data: cohorts, isLoading } = useCohorts()
 */
export const useCohorts = () => useQuery(cohortQueries.getCohorts());

/**
 * 기수 단일 조회 훅
 *
 * @param {GetCohortParams} params - 조회 파라미터
 * @param {number} params.id - 기수 ID
 *
 * @example
 * const { data: cohort, isLoading } = useCohort({ params: { id: 1 } })
 */
export const useCohort = ({ params }: { params: GetCohortParams }) =>
  useQuery(cohortQueries.getCohort({ params }));

/**
 * 기수 생성 훅
 *
 * @example
 * const { mutate: createCohort, isPending } = useCreateCohort()
 * createCohort({ payload: { name: '14기', recruitStartAt: '2024-01-01', recruitEndAt: '2024-01-31' } })
 */
export const useCreateCohort = () => useMutation(cohortMutations.createCohort());

/**
 * 기수 수정 훅 (PATCH /api/v1/admin/cohorts/{id})
 *
 * @example
 * const { mutate: updateCohort, isPending } = useUpdateCohort()
 * updateCohort({ params: { id: 1 }, payload: { name: '14기 (수정)' } })
 */
export const useUpdateCohort = () => useMutation(cohortMutations.updateCohort());

/**
 * 기수 삭제 훅
 *
 * @example
 * const { mutate: deleteCohort, isPending } = useDeleteCohort()
 * deleteCohort({ params: { id: 1 } })
 */
export const useDeleteCohort = () => useMutation(cohortMutations.deleteCohort());

/**
 * 기수 파트 설정 수정 훅 (PUT /api/v1/admin/cohorts/{id}/parts)
 *
 * @example
 * const { mutate: updateCohortParts, isPending } = useUpdateCohortParts()
 * updateCohortParts({ params: { id: 1 }, payload: { parts: [...] } })
 */
export const useUpdateCohortParts = () =>
  useMutation(cohortMutations.updateCohortParts());

/**
 * 현재 활성 기수 조회 훅 (GET /api/v1/cohorts/active — public)
 *
 * @example
 * const { data: activeCohort } = useActiveCohort()
 */
export const useActiveCohort = () => useQuery(cohortPublicQueries.getActiveCohort());
