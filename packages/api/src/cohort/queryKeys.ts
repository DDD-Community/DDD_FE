import type { GetCohortParams } from "./types";

export const cohortKeys = {
  /** 기수 base key */
  all: ["cohorts"] as const,

  /** 기수 목록 key */
  lists: () => [...cohortKeys.all, "list"] as const,

  /**
   * 기수 단일 조회 key
   *
   * @param {GetCohortParams} params - 조회 파라미터
   * @param {number} params.id - 기수 ID
   */
  detail: (params: GetCohortParams) =>
    [...cohortKeys.all, "detail", params] as const,
};
