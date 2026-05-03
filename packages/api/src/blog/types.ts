import type {
  CreateBlogPostRequestDto,
  UpdateBlogPostRequestDto,
  BlogGetPublicListParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/blog-posts - 블로그 공개 목록 조회
export type GetBlogPostsParams = BlogGetPublicListParams;
export type GetBlogPostsResponse = BlogPostListDto;

// 무한 스크롤용 파라미터 (cursor는 useInfiniteQuery의 pageParam이 관리)
export type GetInfiniteBlogPostsParams = Omit<GetBlogPostsParams, "cursor">;

// GET /api/v1/admin/blog-posts - 어드민 블로그 전체 목록 조회
export type GetAdminBlogPostsResponse = BlogPostListDto;

// GET /api/v1/admin/blog-posts/{id} - 어드민 블로그 단건 조회
export type GetAdminBlogPostParams = { id: number };
export type GetAdminBlogPostResponse = BlogPostDto;

// POST /api/v1/admin/blog-posts - 블로그 생성 (어드민)
export type PostCreateBlogPostRequest = CreateBlogPostRequestDto;
export type PostCreateBlogPostResponse = BlogPostDto;

// PATCH /api/v1/admin/blog-posts/{id} - 블로그 수정 (어드민)
export type PatchUpdateBlogPostParams = { id: number };
export type PatchUpdateBlogPostRequest = UpdateBlogPostRequestDto;
export type PatchUpdateBlogPostResponse = BlogPostDto;

// DELETE /api/v1/admin/blog-posts/{id} - 블로그 삭제 (어드민)
export type DeleteBlogPostParams = { id: number };
export type DeleteBlogPostResponse = void;

// 엔티티 타입
export interface BlogPostDto {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: string;
  externalUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListDto {
  items: BlogPostDto[];
  nextCursor?: string;
  hasMore: boolean;
}
