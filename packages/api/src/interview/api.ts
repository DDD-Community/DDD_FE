import {
  interviewListSlots,
  interviewGetSlot,
  interviewCreateSlot,
  interviewUpdateSlot,
  interviewDeleteSlot,
  interviewCreateReservation,
} from "../generated/admin-interview/admin-interview";
import type {
  GetInterviewSlotsParams,
  GetInterviewSlotParams,
  PostCreateInterviewSlotRequest,
  PatchUpdateInterviewSlotParams,
  PatchUpdateInterviewSlotRequest,
  DeleteInterviewSlotParams,
  PostCreateInterviewReservationParams,
  PostCreateInterviewReservationRequest,
} from "./types";

export const interviewAPI = {
  /** 기수/파트 필터로 슬롯을 조회합니다. */
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) =>
    interviewListSlots(params),

  /** 면접 슬롯 상세 조회 */
  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    interviewGetSlot(params.id),

  /** 새로운 면접 슬롯을 생성합니다. */
  createInterviewSlot: ({
    payload,
  }: {
    payload: PostCreateInterviewSlotRequest;
  }) => interviewCreateSlot(payload),

  /** 면접 슬롯 수정 */
  updateInterviewSlot: ({
    params,
    payload,
  }: {
    params: PatchUpdateInterviewSlotParams;
    payload: PatchUpdateInterviewSlotRequest;
  }) => interviewUpdateSlot(params.id, payload),

  /** 면접 슬롯 삭제 */
  deleteInterviewSlot: ({ params }: { params: DeleteInterviewSlotParams }) =>
    interviewDeleteSlot(params.id),

  /** 지원자를 특정 슬롯에 배정하고 구글 캘린더 이벤트를 생성합니다. */
  createInterviewReservation: ({
    params,
    payload,
  }: {
    params: PostCreateInterviewReservationParams;
    payload: PostCreateInterviewReservationRequest;
  }) => interviewCreateReservation(params.slotId, payload),
};
