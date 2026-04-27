import { getApiClient } from "../client";
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
  getInterviewSlots: ({ params }: { params: GetInterviewSlotsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));

    const query = searchParams.toString();
    return getApiClient().get<GetInterviewSlotsResponse>(
      `${INTERVIEW_BASE_URL}/slots${query ? `?${query}` : ""}`,
    );
  },

  getInterviewSlot: ({ params }: { params: GetInterviewSlotParams }) =>
    getApiClient().get<GetInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`,
    ),

  createInterviewSlot: ({
    payload,
  }: {
    payload: PostCreateInterviewSlotRequest;
  }) =>
    getApiClient().post<PostCreateInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots`,
      payload,
    ),

  updateInterviewSlot: ({
    params,
    payload,
  }: {
    params: PatchUpdateInterviewSlotParams;
    payload: PatchUpdateInterviewSlotRequest;
  }) =>
    getApiClient().patch<PatchUpdateInterviewSlotResponse>(
      `${INTERVIEW_BASE_URL}/slots/${params.id}`,
      payload,
    ),

  deleteInterviewSlot: ({ params }: { params: DeleteInterviewSlotParams }) =>
    getApiClient().delete<void>(`${INTERVIEW_BASE_URL}/slots/${params.id}`),

  createInterviewReservation: ({
    payload,
  }: {
    payload: PostCreateInterviewReservationRequest;
  }) =>
    getApiClient().post<PostCreateInterviewReservationResponse>(
      `${INTERVIEW_BASE_URL}/reservations`,
      payload,
    ),

  deleteInterviewReservation: ({
    params,
  }: {
    params: DeleteInterviewReservationParams;
  }) =>
    getApiClient().delete<void>(
      `${INTERVIEW_BASE_URL}/reservations/${params.id}`,
    ),
};
