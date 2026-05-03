import { useQuery, useMutation } from "@tanstack/react-query";
import { interviewQueries, interviewMutations } from "./queries";
import type {
  GetInterviewSlotsParams,
  GetInterviewSlotParams,
} from "./types";

/**
 * 면접 슬롯 목록 조회 훅
 *
 * @param {GetInterviewSlotsParams} params - 조회 파라미터
 * @param {number} [params.cohortId] - 기수 ID 필터 (선택)
 * @param {number} [params.cohortPartId] - 기수 파트 ID 필터 (선택)
 *
 * @example
 * const { data: slots, isLoading } = useInterviewSlots({ params: { cohortId: 1 } })
 */
export const useInterviewSlots = ({
  params,
}: {
  params: GetInterviewSlotsParams;
}) => useQuery(interviewQueries.getInterviewSlots({ params }));

/**
 * 면접 슬롯 단일 조회 훅
 *
 * @param {GetInterviewSlotParams} params - 조회 파라미터
 * @param {number} params.id - 면접 슬롯 ID
 *
 * @example
 * const { data: slot, isLoading } = useInterviewSlot({ params: { id: 1 } })
 */
export const useInterviewSlot = ({
  params,
}: {
  params: GetInterviewSlotParams;
}) => useQuery(interviewQueries.getInterviewSlot({ params }));

/**
 * 면접 슬롯 생성 훅
 *
 * @example
 * const { mutate: createSlot, isPending } = useCreateInterviewSlot()
 * createSlot({ payload: { cohortId: 1, cohortPartId: 1, startAt: '...', endAt: '...' } })
 */
export const useCreateInterviewSlot = () =>
  useMutation(interviewMutations.createInterviewSlot());

/**
 * 면접 슬롯 수정 훅
 *
 * @example
 * const { mutate: updateSlot, isPending } = useUpdateInterviewSlot()
 * updateSlot({ params: { id: 1 }, payload: { location: '강남구청역' } })
 */
export const useUpdateInterviewSlot = () =>
  useMutation(interviewMutations.updateInterviewSlot());

/**
 * 면접 슬롯 삭제 훅
 *
 * @example
 * const { mutate: deleteSlot, isPending } = useDeleteInterviewSlot()
 * deleteSlot({ params: { id: 1 } })
 */
export const useDeleteInterviewSlot = () =>
  useMutation(interviewMutations.deleteInterviewSlot());

/**
 * 면접 예약 생성 훅
 *
 * @example
 * const { mutate: createReservation, isPending } = useCreateInterviewReservation()
 * createReservation({ params: { slotId: 1 }, payload: { applicationFormId: 1 } })
 */
export const useCreateInterviewReservation = () =>
  useMutation(interviewMutations.createInterviewReservation());
