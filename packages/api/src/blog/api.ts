import { getApiClient } from "../client";
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
  getBlogPosts: ({ params }: { params: GetBlogPostsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return getApiClient().get<GetBlogPostsResponse>(
      `${BLOG_BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getBlogPost: ({ params }: { params: GetBlogPostParams }) =>
    getApiClient().get<GetBlogPostResponse>(`${BLOG_BASE_URL}/${params.id}`),

  createBlogPost: ({ payload }: { payload: PostCreateBlogPostRequest }) =>
    getApiClient().post<PostCreateBlogPostResponse>(
      `${BLOG_BASE_URL}/admin`,
      payload,
    ),

  updateBlogPost: ({
    params,
    payload,
  }: {
    params: PutUpdateBlogPostParams;
    payload: PutUpdateBlogPostRequest;
  }) =>
    getApiClient().put<PutUpdateBlogPostResponse>(
      `${BLOG_BASE_URL}/admin/${params.id}`,
      payload,
    ),

  deleteBlogPost: ({ params }: { params: DeleteBlogPostParams }) =>
    getApiClient().delete<void>(`${BLOG_BASE_URL}/admin/${params.id}`),
};
