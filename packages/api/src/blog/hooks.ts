import {
  useQuery,
  useMutation,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { blogQueries, blogMutations } from "./queries";
import type {
  GetBlogPostsParams,
  GetInfiniteBlogPostsParams,
  GetAdminBlogPostParams,
} from "./types";

/**
 * 블로그 공개 목록 조회 훅
 *
 * @param {GetBlogPostsParams} params - 조회 파라미터
 * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
 * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
 *
 * @example
 * const { data: posts, isLoading } = useBlogPosts({ params: { limit: 10 } })
 */
export const useBlogPosts = ({ params }: { params: GetBlogPostsParams }) =>
  useQuery(blogQueries.getBlogPosts({ params }));

/**
 * 블로그 공개 무한 스크롤 목록 조회 훅
 *
 * @param {GetInfiniteBlogPostsParams} params - 조회 파라미터 (cursor 제외)
 * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
 *   useInfiniteBlogPosts({ params: { limit: 20 } })
 * const items = data?.pages.flatMap((p) => p.items) ?? []
 */
export const useInfiniteBlogPosts = ({
  params,
}: {
  params: GetInfiniteBlogPostsParams;
}) => useInfiniteQuery(blogQueries.getInfiniteBlogPosts({ params }));

/**
 * 어드민 블로그 무한 스크롤 목록 조회 훅 (GET /admin/blog-posts)
 *
 * 어드민 관리 페이지에서 사용. 인증된 어드민 API 엔드포인트를 호출한다.
 *
 * @param {GetInfiniteBlogPostsParams} params - 조회 파라미터 (cursor 제외)
 * @param {number} [params.limit] - 페이지 크기 (선택)
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
 *   useAdminInfiniteBlogPosts({ params: { limit: 20 } })
 * const items = data?.pages.flatMap((p) => p.items) ?? []
 */
export const useAdminInfiniteBlogPosts = ({
  params,
}: {
  params: GetInfiniteBlogPostsParams;
}) => useInfiniteQuery(blogQueries.getAdminInfiniteBlogPosts({ params }));

/**
 * 어드민 블로그 단건 조회 훅 (GET /admin/blog-posts/{id})
 *
 * @param {GetAdminBlogPostParams} params - 조회 파라미터
 * @param {number} params.id - 블로그 ID
 *
 * @example
 * const { data: post, isLoading } = useAdminBlogPost({ params: { id: 1 } })
 */
export const useAdminBlogPost = ({ params }: { params: GetAdminBlogPostParams }) =>
  useQuery(blogQueries.getAdminBlogPost({ params }));

/**
 * 블로그 생성 훅 (어드민)
 *
 * @example
 * const { mutate: createPost, isPending } = useCreateBlogPost()
 * createPost({ payload: { title: '제목', excerpt: '요약', externalUrl: 'https://...' } })
 */
export const useCreateBlogPost = () =>
  useMutation(blogMutations.createBlogPost());

/**
 * 블로그 수정 훅 (어드민) - PATCH /admin/blog-posts/{id}
 *
 * @example
 * const { mutate: updatePost, isPending } = useUpdateBlogPost()
 * updatePost({ params: { id: 1 }, payload: { title: '수정된 제목' } })
 */
export const useUpdateBlogPost = () =>
  useMutation(blogMutations.updateBlogPost());

/**
 * 블로그 삭제 훅 (어드민)
 *
 * @example
 * const { mutate: deletePost, isPending } = useDeleteBlogPost()
 * deletePost({ params: { id: 1 } })
 */
export const useDeleteBlogPost = () =>
  useMutation(blogMutations.deleteBlogPost());
