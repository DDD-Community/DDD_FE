import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { blogAPI } from "./api";
import { blogKeys } from "./queryKeys";
import type {
  GetBlogPostsParams,
  GetBlogPostParams,
  PostCreateBlogPostRequest,
  PutUpdateBlogPostParams,
  PutUpdateBlogPostRequest,
  DeleteBlogPostParams,
} from "./types";

export const blogQueries = {
  /**
   * 블로그 공개 목록 조회 쿼리
   *
   * @param {GetBlogPostsParams} params - 조회 파라미터
   * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(blogQueries.getBlogPosts({ params: { limit: 10 } }))
   */
  getBlogPosts: ({ params }: { params: GetBlogPostsParams }) =>
    queryOptions({
      queryKey: blogKeys.list(params),
      queryFn: () => blogAPI.getBlogPosts({ params }),
    }),

  /**
   * 블로그 단일 조회 쿼리
   *
   * @param {GetBlogPostParams} params - 조회 파라미터
   * @param {number} params.id - 블로그 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(blogQueries.getBlogPost({ params: { id: 1 } }))
   */
  getBlogPost: ({ params }: { params: GetBlogPostParams }) =>
    queryOptions({
      queryKey: blogKeys.detail(params),
      queryFn: () => blogAPI.getBlogPost({ params }),
      enabled: !!params.id,
    }),
};

export const blogMutations = {
  /**
   * 블로그 생성 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(blogMutations.createBlogPost())
   * mutation.mutate({ payload: { title: '제목', excerpt: '요약', externalUrl: 'https://...' } })
   */
  createBlogPost: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostCreateBlogPostRequest }) =>
        blogAPI.createBlogPost({ payload }),
    }),

  /**
   * 블로그 수정 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(blogMutations.updateBlogPost())
   * mutation.mutate({ params: { id: 1 }, payload: { title: '수정된 제목' } })
   */
  updateBlogPost: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PutUpdateBlogPostParams;
        payload: PutUpdateBlogPostRequest;
      }) => blogAPI.updateBlogPost({ params, payload }),
    }),

  /**
   * 블로그 삭제 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(blogMutations.deleteBlogPost())
   * mutation.mutate({ params: { id: 1 } })
   */
  deleteBlogPost: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteBlogPostParams }) =>
        blogAPI.deleteBlogPost({ params }),
    }),
};
