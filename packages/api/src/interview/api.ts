import { api } from "../fetchClient";
import type {
  GetInterviewSlotsParams,
  GetInterviewSlotsResponse,
  GetInterviewSlotParams,
  GetInterviewSlotResponse,
  PostCreateInterviewSlotRequest,
  PostCreateInterviewSlotResponse,
  PatchUpdateInterviewSlotParams,
  PatchUpdateInterviewSlotRequest,
  PatchUpdateInterviewSlotResponse,
  DeleteInterviewSlotParams,
  PostCreateInterviewReservationParams,
  PostCreateInterviewReservationRequest,
  PostCreateInterviewReservationResponse,
  DeleteInterviewReservationParams,
  GetInterviewerCandidatesResponse,
  SyncInterviewSlotMeetingParams,
  SyncInterviewSlotMeetingResponse,
} from "./types";

export const interviewAPI = {
  getInterviewerCandidates: () =>
    api.get(
      "/api/v1/admin/interview-slots/interviewer-candidates",
    ) as unknown as Promise<GetInterviewerCandidatesResponse>,

  syncInterviewSlotMeeting: ({ params }: { params: SyncInterviewSlotMeetingParams }) =>
    api.post("/api/v1/admin/interview-slots/{id}/meeting/sync", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<SyncInterviewSlotMeetingResponse>,
  /** 면접 슬롯 목록 조회 - GET /api/v1/admin/interview-slots */
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) =>
    api.get("/api/v1/admin/interview-slots", {
      params: { query: params ?? {} },
    }) as unknown as Promise<GetInterviewSlotsResponse>,

  /** 면접 슬롯 상세 - GET /api/v1/admin/interview-slots/{id} */
  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    api.get("/api/v1/admin/interview-slots/{id}", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<GetInterviewSlotResponse>,

  /** 면접 슬롯 생성 - POST /api/v1/admin/interview-slots */
  createInterviewSlot: ({ payload }: { payload: PostCreateInterviewSlotRequest }) =>
    api.post("/api/v1/admin/interview-slots", {
      body: payload,
    }) as unknown as Promise<PostCreateInterviewSlotResponse>,

  /** 면접 슬롯 수정 - PATCH /api/v1/admin/interview-slots/{id} */
  updateInterviewSlot: ({
    params,
    payload,
  }: {
    params: PatchUpdateInterviewSlotParams;
    payload: PatchUpdateInterviewSlotRequest;
  }) =>
    api.patch("/api/v1/admin/interview-slots/{id}", {
      params: { path: { id: params.id } },
      body: payload,
    }) as unknown as Promise<PatchUpdateInterviewSlotResponse>,

  /** 면접 슬롯 삭제 - DELETE /api/v1/admin/interview-slots/{id} */
  deleteInterviewSlot: ({ params }: { params: DeleteInterviewSlotParams }) =>
    api.delete("/api/v1/admin/interview-slots/{id}", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<void>,

  /** 면접 예약 생성 - POST /api/v1/admin/interview-slots/{slotId}/reservations */
  createInterviewReservation: ({
    params,
    payload,
  }: {
    params: PostCreateInterviewReservationParams;
    payload: PostCreateInterviewReservationRequest;
  }) =>
    api.post("/api/v1/admin/interview-slots/{slotId}/reservations", {
      params: { path: { slotId: params.slotId } },
      body: payload,
    }) as unknown as Promise<PostCreateInterviewReservationResponse>,

  /** 면접 예약 취소 - DELETE /api/v1/admin/interview-slots/reservations/{reservationId} */
  cancelInterviewReservation: ({ params }: { params: DeleteInterviewReservationParams }) =>
    api.delete("/api/v1/admin/interview-slots/reservations/{reservationId}", {
      params: { path: { reservationId: params.reservationId } },
    }) as unknown as Promise<void>,
};
