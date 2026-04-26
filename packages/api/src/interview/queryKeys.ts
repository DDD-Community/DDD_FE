import type { GetInterviewSlotsParams, GetInterviewSlotParams } from "./types";

export const interviewKeys = {
  /** 면접 base key */
  all: ["interviews"] as const,

  /** 면접 슬롯 목록 key */
  slotLists: () => [...interviewKeys.all, "slots", "list"] as const,

  /**
   * 면접 슬롯 목록 필터 key
   *
   * @param {GetInterviewSlotsParams} params - 조회 파라미터
   * @param {number} [params.cohortId] - 기수 ID 필터 (선택)
   * @param {number} [params.cohortPartId] - 기수 파트 ID 필터 (선택)
   */
  slotList: (params: GetInterviewSlotsParams) =>
    [...interviewKeys.slotLists(), params] as const,

  /**
   * 면접 슬롯 단일 key
   *
   * @param {GetInterviewSlotParams} params - 조회 파라미터
   * @param {number} params.id - 면접 슬롯 ID
   */
  slotDetail: (params: GetInterviewSlotParams) =>
    [...interviewKeys.all, "slots", "detail", params] as const,
};
