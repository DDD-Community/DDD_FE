import {
  useQuery,
  useMutation,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { blogQueries, blogMutations } from "./queries";
import type {
  GetBlogPostsParams,
  GetBlogPostParams,
  GetInfiniteBlogPostsParams,
  PostCreateBlogPostRequest,
  PutUpdateBlogPostParams,
  PutUpdateBlogPostRequest,
  DeleteBlogPostParams,
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
 * 블로그 무한 스크롤 목록 조회 훅
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
 * 블로그 단일 조회 훅
 *
 * @param {GetBlogPostParams} params - 조회 파라미터
 * @param {number} params.id - 블로그 ID
 *
 * @example
 * const { data: post, isLoading } = useBlogPost({ params: { id: 1 } })
 */
export const useBlogPost = ({ params }: { params: GetBlogPostParams }) =>
  useQuery(blogQueries.getBlogPost({ params }));

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
 * 블로그 수정 훅 (어드민)
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
