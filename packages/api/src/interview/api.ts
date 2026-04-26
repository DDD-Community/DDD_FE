import { apiFetch } from "../client";
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
  PostCreateInterviewReservationRequest,
  PostCreateInterviewReservationResponse,
  DeleteInterviewReservationParams,
} from "./types";

const INTERVIEW_BASE_URL = "/api/v1/interview" as const;

export const interviewAPI = {
  /**
   * 면접 슬롯 목록 조회
   *
   * @param {GetInterviewSlotsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID 필터 (선택)
   * @param {number} [params.cohortPartId] - 기수 파트 ID 필터 (선택)
   *
   * @returns {Promise<GetInterviewSlotsResponse>} 면접 슬롯 목록 응답
   *
   * @example
   * const data = await interviewAPI.getInterviewSlots({ params: { cohortId: 1 } })
   */
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));

    const query = searchParams.toString();
    return apiFetch<GetInterviewSlotsResponse>(
      `${INTERVIEW_BASE_URL}/slots${query ? `?${query}` : ""}`
    );
  },

  /**
   * 면접 슬롯 단일 조회
   *
   * @param {GetInterviewSlotParams} params - 조회 파라미터
   * @param {number} params.id - 면접 슬롯 ID
   *
   * @returns {Promise<GetInterviewSlotResponse>} 면접 슬롯 상세 응답
   *
   * @example
   * const data = await interviewAPI.getInterviewSlot({ params: { id: 1 } })
   */
  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    apiFetch<GetInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`
    ),

  /**
   * 면접 슬롯 생성
   *
   * @param {PostCreateInterviewSlotRequest} payload - 슬롯 생성 데이터
   * @param {number} payload.cohortId - 기수 ID
   * @param {number} payload.cohortPartId - 기수 파트 ID
   * @param {string} payload.startAt - 시작 시간
   * @param {string} payload.endAt - 종료 시간
   * @param {number} [payload.capacity] - 수용 인원 (기본 1, 선택)
   * @param {string} [payload.location] - 장소 (선택)
   * @param {string} [payload.description] - 설명 (선택)
   *
   * @returns {Promise<PostCreateInterviewSlotResponse>} 생성된 면접 슬롯 응답
   *
   * @example
   * const data = await interviewAPI.createInterviewSlot({
   *   payload: { cohortId: 1, cohortPartId: 1, startAt: '2024-03-01T10:00:00', endAt: '2024-03-01T10:30:00' }
   * })
   */
  createInterviewSlot: ({
    payload,
  }: {
    payload: PostCreateInterviewSlotRequest;
  }) =>
    apiFetch<PostCreateInterviewSlotResponse>(`${INTERVIEW_BASE_URL}/slots`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 면접 슬롯 수정
   *
   * @param {Object} args - 함수 인자
   * @param {PatchUpdateInterviewSlotParams} args.params - 슬롯 파라미터
   * @param {number} args.params.id - 면접 슬롯 ID
   * @param {PatchUpdateInterviewSlotRequest} args.payload - 슬롯 수정 데이터
   * @param {string} [args.payload.startAt] - 시작 시간 (선택)
   * @param {string} [args.payload.endAt] - 종료 시간 (선택)
   * @param {number} [args.payload.capacity] - 수용 인원 (선택)
   * @param {string} [args.payload.location] - 장소 (선택)
   * @param {string} [args.payload.description] - 설명 (선택)
   *
   * @returns {Promise<PatchUpdateInterviewSlotResponse>} 수정된 면접 슬롯 응답
   *
   * @example
   * const data = await interviewAPI.updateInterviewSlot({
   *   params: { id: 1 },
   *   payload: { location: '강남구청역' }
   * })
   */
  updateInterviewSlot: ({
    params,
    payload,
  }: {
    params: PatchUpdateInterviewSlotParams;
    payload: PatchUpdateInterviewSlotRequest;
  }) =>
    apiFetch<PatchUpdateInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 면접 슬롯 삭제
   *
   * @param {DeleteInterviewSlotParams} params - 삭제할 슬롯 파라미터
   * @param {number} params.id - 면접 슬롯 ID
   *
   * @returns {Promise<void>}
   *
   * @example
   * await interviewAPI.deleteInterviewSlot({ params: { id: 1 } })
   */
  deleteInterviewSlot: ({ params }: { params: DeleteInterviewSlotParams }) =>
    apiFetch<void>(`${INTERVIEW_BASE_URL}/slots/${params.id}`, {
      method: "DELETE",
    }),

  /**
   * 면접 예약
   *
   * @param {PostCreateInterviewReservationRequest} payload - 예약 데이터
   * @param {number} payload.applicationFormId - 지원서 ID
   *
   * @returns {Promise<PostCreateInterviewReservationResponse>} 생성된 면접 예약 응답
   *
   * @example
   * const data = await interviewAPI.createInterviewReservation({
   *   payload: { applicationFormId: 1 }
   * })
   */
  createInterviewReservation: ({
    payload,
  }: {
    payload: PostCreateInterviewReservationRequest;
  }) =>
    apiFetch<PostCreateInterviewReservationResponse>(
      `${INTERVIEW_BASE_URL}/reservations`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 면접 예약 취소
   *
   * @param {DeleteInterviewReservationParams} params - 취소할 예약 파라미터
   * @param {number} params.id - 면접 예약 ID
   *
   * @returns {Promise<void>}
   *
   * @example
   * await interviewAPI.deleteInterviewReservation({ params: { id: 1 } })
   */
  deleteInterviewReservation: ({
    params,
  }: {
    params: DeleteInterviewReservationParams;
  }) =>
    apiFetch<void>(`${INTERVIEW_BASE_URL}/reservations/${params.id}`, {
      method: "DELETE",
    }),
};
