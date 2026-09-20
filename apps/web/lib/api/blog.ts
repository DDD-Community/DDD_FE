import { blogAPI } from "@ddd/api";
import type { ArticleItem } from "@/constants/articles";
import { mapArticle } from "@/lib/mappers/article";
import { ensureApiConfigured } from "./config";
import { fetchAllPages, MAX_LIMIT } from "./fetchAllPages";

export type ArticleCursorPage = {
  items: ArticleItem[];
  nextCursor: string | null;
};

export async function fetchPublicArticlesPage(options?: {
  cursor?: string;
  limit?: number;
}): Promise<ArticleCursorPage> {
  ensureApiConfigured();
  const response = await blogAPI.getBlogPosts({
    params: {
      cursor: options?.cursor,
      limit: options?.limit ?? 4,
    },
  });
  return {
    items: response.items
      .map(mapArticle)
      .filter((item): item is ArticleItem => Boolean(item)),
    nextCursor: response.nextCursor ?? null,
  };
}

/**
 * 공개 아티클 전부.
 *
 * BE 커서 버그 때문에 한 번에 다 받는다 — 이유와 되돌리는 시점은 `fetchAllPages` 참고.
 * 블로그는 아직 `createdAt` 이 겹치는 글이 없어 터진 적은 없지만, 글을 한꺼번에 등록하면
 * 프로젝트와 똑같이 조용히 누락된다. 커서를 타지 않는 쪽이 안전하다.
 *
 * 매핑 실패한 글(제목 없음)을 걸러낸 **뒤에** 페이지를 나누게 되는 것도 이득이다.
 * 페이지마다 따로 걸러내면 어떤 페이지만 4개가 아니라 3개로 나온다.
 */
export async function fetchAllPublicArticles(): Promise<ArticleItem[]> {
  return fetchAllPages((cursor) => fetchPublicArticlesPage({ cursor, limit: MAX_LIMIT }), "blog");
}
