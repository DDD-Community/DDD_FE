import type {
  CreateInterviewSlotRequestDto,
  UpdateInterviewSlotRequestDto,
  CreateInterviewReservationRequestDto,
  InterviewListSlotsParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/admin/interview-slots - 면접 슬롯 목록 조회
export type GetInterviewSlotsParams = InterviewListSlotsParams;
export type GetInterviewSlotsResponse = void;

// GET /api/v1/admin/interview-slots/{id} - 면접 슬롯 단일 조회
export type GetInterviewSlotParams = { id: number };
export type GetInterviewSlotResponse = void;

// POST /api/v1/admin/interview-slots - 면접 슬롯 생성
export type PostCreateInterviewSlotRequest = CreateInterviewSlotRequestDto;
export type PostCreateInterviewSlotResponse = void;

// PATCH /api/v1/admin/interview-slots/{id} - 면접 슬롯 수정
export type PatchUpdateInterviewSlotParams = { id: number };
export type PatchUpdateInterviewSlotRequest = UpdateInterviewSlotRequestDto;
export type PatchUpdateInterviewSlotResponse = void;

// DELETE /api/v1/admin/interview-slots/{id} - 면접 슬롯 삭제
export type DeleteInterviewSlotParams = { id: number };
export type DeleteInterviewSlotResponse = void;

// POST /api/v1/admin/interview-slots/{slotId}/reservations - 면접 예약
export type PostCreateInterviewReservationParams = { slotId: number };
export type PostCreateInterviewReservationRequest =
  CreateInterviewReservationRequestDto;
export type PostCreateInterviewReservationResponse = void;
