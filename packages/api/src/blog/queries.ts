import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";
import { blogAPI } from "./api";
import { blogKeys } from "./queryKeys";
import type {
  GetBlogPostsParams,
  GetInfiniteBlogPostsParams,
  GetAdminBlogPostParams,
  PostCreateBlogPostRequest,
  PatchUpdateBlogPostParams,
  PatchUpdateBlogPostRequest,
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
   * 블로그 공개 무한 스크롤 목록 조회 쿼리
   *
   * cursor는 useInfiniteQuery의 pageParam으로 자동 관리되므로
   * params에 cursor를 직접 전달하지 않는다.
   *
   * @param {GetInfiniteBlogPostsParams} params - 조회 파라미터 (cursor 제외)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {InfiniteQueryOptions} TanStack Query Infinite 옵션 객체
   *
   * @example
   * const query = useInfiniteQuery(blogQueries.getInfiniteBlogPosts({ params: { limit: 20 } }))
   */
  getInfiniteBlogPosts: ({ params }: { params: GetInfiniteBlogPostsParams }) =>
    infiniteQueryOptions({
      queryKey: blogKeys.infiniteList(params),
      queryFn: ({ pageParam }) =>
        blogAPI.getBlogPosts({ params: { ...params, cursor: pageParam } }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) =>
        last.hasMore ? last.nextCursor : undefined,
    }),

  /**
   * 어드민 블로그 무한 스크롤 목록 조회 쿼리 (GET /admin/blog-posts)
   *
   * 어드민 페이지에서 사용. cursor는 useInfiniteQuery의 pageParam으로 관리.
   *
   * @param {GetInfiniteBlogPostsParams} params - 조회 파라미터 (cursor 제외)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   *
   * @returns {InfiniteQueryOptions} TanStack Query Infinite 옵션 객체
   *
   * @example
   * const query = useInfiniteQuery(blogQueries.getAdminInfiniteBlogPosts({ params: { limit: 20 } }))
   */
  getAdminInfiniteBlogPosts: ({ params }: { params: GetInfiniteBlogPostsParams }) =>
    infiniteQueryOptions({
      queryKey: blogKeys.adminInfiniteList(params),
      queryFn: () => blogAPI.getAdminBlogPosts(),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) =>
        last.hasMore ? last.nextCursor : undefined,
    }),

  /**
   * 어드민 블로그 단건 조회 쿼리 (GET /admin/blog-posts/{id})
   *
   * @param {GetAdminBlogPostParams} params - 조회 파라미터
   * @param {number} params.id - 블로그 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(blogQueries.getAdminBlogPost({ params: { id: 1 } }))
   */
  getAdminBlogPost: ({ params }: { params: GetAdminBlogPostParams }) =>
    queryOptions({
      queryKey: blogKeys.adminDetail(params),
      queryFn: () => blogAPI.getAdminBlogPost({ params }),
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
   * 블로그 수정 mutation (어드민) - PATCH /admin/blog-posts/{id}
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
        params: PatchUpdateBlogPostParams;
        payload: PatchUpdateBlogPostRequest;
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
