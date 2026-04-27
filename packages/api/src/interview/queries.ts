import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { interviewAPI } from "./api";
import { interviewKeys } from "./queryKeys";
import type {
  GetInterviewSlotsParams,
  GetInterviewSlotParams,
  PostCreateInterviewSlotRequest,
  PatchUpdateInterviewSlotParams,
  PatchUpdateInterviewSlotRequest,
  DeleteInterviewSlotParams,
  PostCreateInterviewReservationRequest,
  DeleteInterviewReservationParams,
} from "./types";

export const interviewQueries = {
  /**
   * 면접 슬롯 목록 조회 쿼리
   *
   * @param {GetInterviewSlotsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID 필터 (선택)
   * @param {number} [params.cohortPartId] - 기수 파트 ID 필터 (선택)
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(interviewQueries.getInterviewSlots({ params: { cohortId: 1 } }))
   */
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) =>
    queryOptions({
      queryKey: interviewKeys.slotList(params),
      queryFn: () => interviewAPI.getInterviewSlots({ params }),
    }),

  /**
   * 면접 슬롯 단일 조회 쿼리
   *
   * @param {GetInterviewSlotParams} params - 조회 파라미터
   * @param {number} params.id - 면접 슬롯 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(interviewQueries.getInterviewSlot({ params: { id: 1 } }))
   */
  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    queryOptions({
      queryKey: interviewKeys.slotDetail(params),
      queryFn: () => interviewAPI.getInterviewSlot({ params }),
      enabled: !!params.id,
    }),
};

export const interviewMutations = {
  /**
   * 면접 슬롯 생성 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(interviewMutations.createInterviewSlot())
   * mutation.mutate({ payload: { cohortId: 1, cohortPartId: 1, startAt: '...', endAt: '...' } })
   */
  createInterviewSlot: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostCreateInterviewSlotRequest }) =>
        interviewAPI.createInterviewSlot({ payload }),
    }),

  /**
   * 면접 슬롯 수정 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(interviewMutations.updateInterviewSlot())
   * mutation.mutate({ params: { id: 1 }, payload: { location: '강남구청역' } })
   */
  updateInterviewSlot: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PatchUpdateInterviewSlotParams;
        payload: PatchUpdateInterviewSlotRequest;
      }) => interviewAPI.updateInterviewSlot({ params, payload }),
    }),

  /**
   * 면접 슬롯 삭제 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(interviewMutations.deleteInterviewSlot())
   * mutation.mutate({ params: { id: 1 } })
   */
  deleteInterviewSlot: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteInterviewSlotParams }) =>
        interviewAPI.deleteInterviewSlot({ params }),
    }),

  /**
   * 면접 예약 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(interviewMutations.createInterviewReservation())
   * mutation.mutate({ payload: { applicationFormId: 1 } })
   */
  createInterviewReservation: () =>
    mutationOptions({
      mutationFn: ({
        payload,
      }: {
        payload: PostCreateInterviewReservationRequest;
      }) => interviewAPI.createInterviewReservation({ payload }),
    }),

  /**
   * 면접 예약 취소 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(interviewMutations.deleteInterviewReservation())
   * mutation.mutate({ params: { id: 1 } })
   */
  deleteInterviewReservation: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteInterviewReservationParams }) =>
        interviewAPI.deleteInterviewReservation({ params }),
    }),
};
