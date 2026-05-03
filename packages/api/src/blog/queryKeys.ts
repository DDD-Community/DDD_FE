import type {
  GetBlogPostsParams,
  GetInfiniteBlogPostsParams,
  GetAdminBlogPostParams,
} from "./types";

export const blogKeys = {
  /** 블로그 base key */
  all: ["blog"] as const,

  /** 블로그 공개 목록 key */
  lists: () => [...blogKeys.all, "list"] as const,

  /**
   * 블로그 공개 목록 필터 key
   *
   * @param {GetBlogPostsParams} params - 조회 파라미터
   * @param {string} [params.cursor] - 다음 페이지 커서 (선택)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   */
  list: (params: GetBlogPostsParams) =>
    [...blogKeys.lists(), params] as const,

  /** 블로그 무한 스크롤 목록 key */
  infiniteLists: () => [...blogKeys.all, "infinite-list"] as const,

  /**
   * 블로그 무한 스크롤 필터 key
   *
   * @param {GetInfiniteBlogPostsParams} params - 조회 파라미터 (cursor 제외)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   */
  infiniteList: (params: GetInfiniteBlogPostsParams) =>
    [...blogKeys.infiniteLists(), params] as const,

  /** 어드민 블로그 전체 목록 key */
  adminLists: () => [...blogKeys.all, "admin-list"] as const,

  /** 어드민 블로그 무한 스크롤 목록 key */
  adminInfiniteLists: () => [...blogKeys.all, "admin-infinite-list"] as const,

  /** 어드민 블로그 무한 스크롤 필터 key */
  adminInfiniteList: (params: GetInfiniteBlogPostsParams) =>
    [...blogKeys.adminInfiniteLists(), params] as const,

  /** 어드민 블로그 단건 key */
  adminDetails: () => [...blogKeys.all, "admin-detail"] as const,

  /**
   * 어드민 블로그 단건 필터 key
   *
   * @param {GetAdminBlogPostParams} params - 조회 파라미터
   * @param {number} params.id - 블로그 ID
   */
  adminDetail: (params: GetAdminBlogPostParams) =>
    [...blogKeys.adminDetails(), params] as const,
};
