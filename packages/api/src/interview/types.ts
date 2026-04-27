import type {
  CreateInterviewSlotRequestDto,
  UpdateInterviewSlotRequestDto,
  CreateInterviewReservationRequestDto,
  InterviewListSlotsParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/interview/slots - 면접 슬롯 목록 조회
export type GetInterviewSlotsParams = InterviewListSlotsParams;
export type GetInterviewSlotsResponse = InterviewSlotDto[];

// GET /api/v1/interview/slots/{id} - 면접 슬롯 단일 조회
export type GetInterviewSlotParams = { id: number };
export type GetInterviewSlotResponse = InterviewSlotDto;

// POST /api/v1/interview/slots - 면접 슬롯 생성
export type PostCreateInterviewSlotRequest = CreateInterviewSlotRequestDto;
export type PostCreateInterviewSlotResponse = InterviewSlotDto;

// PATCH /api/v1/interview/slots/{id} - 면접 슬롯 수정
export type PatchUpdateInterviewSlotParams = { id: number };
export type PatchUpdateInterviewSlotRequest = UpdateInterviewSlotRequestDto;
export type PatchUpdateInterviewSlotResponse = InterviewSlotDto;

// DELETE /api/v1/interview/slots/{id} - 면접 슬롯 삭제
export type DeleteInterviewSlotParams = { id: number };
export type DeleteInterviewSlotResponse = void;

// POST /api/v1/interview/reservations - 면접 예약
export type PostCreateInterviewReservationRequest =
  CreateInterviewReservationRequestDto;
export type PostCreateInterviewReservationResponse = InterviewReservationDto;

// DELETE /api/v1/interview/reservations/{id} - 면접 예약 취소
export type DeleteInterviewReservationParams = { id: number };
export type DeleteInterviewReservationResponse = void;

// 엔티티 타입
export interface InterviewSlotDto {
  id: number;
  cohortId: number;
  cohortPartId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  location?: string;
  description?: string;
  reservedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewReservationDto {
  id: number;
  slotId: number;
  applicationFormId: number;
  createdAt: string;
}
