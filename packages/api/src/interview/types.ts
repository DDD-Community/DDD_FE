import type { components, paths } from "../generated/api";

// Request DTO
export type CreateInterviewSlotRequestDto = components["schemas"]["CreateInterviewSlotRequestDto"];
export type UpdateInterviewSlotRequestDto = components["schemas"]["UpdateInterviewSlotRequestDto"];
export type CreateInterviewReservationRequestDto =
  components["schemas"]["CreateInterviewReservationRequestDto"];

// 엔티티 타입 (BE 응답 schema 정의됨)
export type InterviewSlot = components["schemas"]["InterviewSlotResponseDto"];
export type InterviewSlotResponseDto = InterviewSlot;
export type InterviewSlotInterviewerResponseDto =
  components["schemas"]["InterviewSlotInterviewerResponseDto"];
export type InterviewSlotMeetingResponseDto =
  components["schemas"]["InterviewSlotMeetingResponseDto"];
export type InterviewSlotMeetingStatus = InterviewSlotMeetingResponseDto["status"];
export type InterviewerCandidateResponseDto =
  components["schemas"]["InterviewerCandidateResponseDto"];
export type InterviewReservation = components["schemas"]["InterviewReservationResponseDto"];
export type InterviewReservationResponseDto = InterviewReservation;

// GET /api/v1/admin/interview-slots - 면접 슬롯 목록 조회
export type GetInterviewSlotsParams =
  paths["/api/v1/admin/interview-slots"]["get"]["parameters"]["query"];
export type GetInterviewSlotsResponse = InterviewSlot[];
export type GetInterviewerCandidatesResponse = InterviewerCandidateResponseDto[];
export type SyncInterviewSlotMeetingParams = { id: number };
export type SyncInterviewSlotMeetingResponse = InterviewSlot;
export type InterviewListSlotsParams = GetInterviewSlotsParams;

// GET /api/v1/admin/interview-slots/{id} - 면접 슬롯 단일 조회
export type GetInterviewSlotParams = { id: number };
export type GetInterviewSlotResponse = InterviewSlot;

// POST /api/v1/admin/interview-slots - 면접 슬롯 생성
export type PostCreateInterviewSlotRequest = CreateInterviewSlotRequestDto;
export type PostCreateInterviewSlotResponse = InterviewSlot;

// PATCH /api/v1/admin/interview-slots/{id} - 면접 슬롯 수정
export type PatchUpdateInterviewSlotParams = { id: number };
export type PatchUpdateInterviewSlotRequest = UpdateInterviewSlotRequestDto;
export type PatchUpdateInterviewSlotResponse = InterviewSlot;

// DELETE /api/v1/admin/interview-slots/{id} - 면접 슬롯 삭제
export type DeleteInterviewSlotParams = { id: number };
export type DeleteInterviewSlotResponse = void;

// POST /api/v1/admin/interview-slots/{slotId}/reservations - 면접 예약
export type PostCreateInterviewReservationParams = { slotId: number };
export type PostCreateInterviewReservationRequest = CreateInterviewReservationRequestDto;
export type PostCreateInterviewReservationResponse = InterviewReservation;

// DELETE /api/v1/admin/interview-slots/reservations/{reservationId} - 면접 예약 취소
export type DeleteInterviewReservationParams = { reservationId: number };
export type DeleteInterviewReservationResponse = void;
