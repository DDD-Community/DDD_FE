import type {
  CreateBlogPostRequestDto,
  UpdateBlogPostRequestDto,
  BlogGetPublicListParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/blog - 블로그 공개 목록 조회
export type GetBlogPostsParams = BlogGetPublicListParams;
export type GetBlogPostsResponse = BlogPostListDto;

// GET /api/v1/blog/{id} - 블로그 단일 조회
export type GetBlogPostParams = { id: number };
export type GetBlogPostResponse = BlogPostDto;

// POST /api/v1/blog/admin - 블로그 생성 (어드민)
export type PostCreateBlogPostRequest = CreateBlogPostRequestDto;
export type PostCreateBlogPostResponse = BlogPostDto;

// PUT /api/v1/blog/admin/{id} - 블로그 수정 (어드민)
export type PutUpdateBlogPostParams = { id: number };
export type PutUpdateBlogPostRequest = UpdateBlogPostRequestDto;
export type PutUpdateBlogPostResponse = BlogPostDto;

// DELETE /api/v1/blog/admin/{id} - 블로그 삭제 (어드민)
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
