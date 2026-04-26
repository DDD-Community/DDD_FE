import { apiFetch } from "../client";
import type {
  GetBlogPostsParams,
  GetBlogPostsResponse,
  GetBlogPostParams,
  GetBlogPostResponse,
  PostCreateBlogPostRequest,
  PostCreateBlogPostResponse,
  PutUpdateBlogPostParams,
  PutUpdateBlogPostRequest,
  PutUpdateBlogPostResponse,
  DeleteBlogPostParams,
} from "./types";

const BLOG_BASE_URL = "/api/v1/blog" as const;

export const blogAPI = {
  /**
   * 블로그 공개 목록 조회
   *
   * @param {GetBlogPostsParams} params - 조회 파라미터
   * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {Promise<GetBlogPostsResponse>} 블로그 목록 응답
   *
   * @example
   * const data = await blogAPI.getBlogPosts({ params: { limit: 10 } })
   */
  getBlogPosts: ({ params }: { params: GetBlogPostsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return apiFetch<GetBlogPostsResponse>(
      `${BLOG_BASE_URL}${query ? `?${query}` : ""}`
    );
  },

  /**
   * 블로그 단일 조회
   *
   * @param {GetBlogPostParams} params - 조회 파라미터
   * @param {number} params.id - 블로그 ID
   *
   * @returns {Promise<GetBlogPostResponse>} 블로그 상세 응답
   *
   * @example
   * const data = await blogAPI.getBlogPost({ params: { id: 1 } })
   */
  getBlogPost: ({ params }: { params: GetBlogPostParams }) =>
    apiFetch<GetBlogPostResponse>(`${BLOG_BASE_URL}/${params.id}`),

  /**
   * 블로그 생성 (어드민)
   *
   * @param {PostCreateBlogPostRequest} payload - 블로그 생성 데이터
   * @param {string} payload.title - 블로그 제목
   * @param {string} payload.excerpt - 블로그 요약
   * @param {string} [payload.thumbnail] - 썸네일 URL (선택)
   * @param {string} payload.externalUrl - 외부 링크 URL
   *
   * @returns {Promise<PostCreateBlogPostResponse>} 생성된 블로그 응답
   *
   * @example
   * const data = await blogAPI.createBlogPost({
   *   payload: { title: '제목', excerpt: '요약', externalUrl: 'https://...' }
   * })
   */
  createBlogPost: ({ payload }: { payload: PostCreateBlogPostRequest }) =>
    apiFetch<PostCreateBlogPostResponse>(`${BLOG_BASE_URL}/admin`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 블로그 수정 (어드민)
   *
   * @param {Object} args - 함수 인자
   * @param {PutUpdateBlogPostParams} args.params - 블로그 파라미터
   * @param {number} args.params.id - 블로그 ID
   * @param {PutUpdateBlogPostRequest} args.payload - 블로그 수정 데이터
   * @param {string} [args.payload.title] - 블로그 제목 (선택)
   * @param {string} [args.payload.excerpt] - 블로그 요약 (선택)
   * @param {string} [args.payload.thumbnail] - 썸네일 URL (선택)
   * @param {string} [args.payload.externalUrl] - 외부 링크 URL (선택)
   *
   * @returns {Promise<PutUpdateBlogPostResponse>} 수정된 블로그 응답
   *
   * @example
   * const data = await blogAPI.updateBlogPost({
   *   params: { id: 1 },
   *   payload: { title: '수정된 제목' }
   * })
   */
  updateBlogPost: ({
    params,
    payload,
  }: {
    params: PutUpdateBlogPostParams;
    payload: PutUpdateBlogPostRequest;
  }) =>
    apiFetch<PutUpdateBlogPostResponse>(
      `${BLOG_BASE_URL}/admin/${params.id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 블로그 삭제 (어드민)
   *
   * @param {DeleteBlogPostParams} params - 삭제할 블로그 파라미터
   * @param {number} params.id - 블로그 ID
   *
   * @returns {Promise<void>}
   *
   * @example
   * await blogAPI.deleteBlogPost({ params: { id: 1 } })
   */
  deleteBlogPost: ({ params }: { params: DeleteBlogPostParams }) =>
    apiFetch<void>(`${BLOG_BASE_URL}/admin/${params.id}`, {
      method: "DELETE",
    }),
};
