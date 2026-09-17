import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ArticleListPageSection } from "@/components/sections/ArticleListPageSection";
import { ARTICLE_LIST_PAGE_SIZE } from "@/constants/articles";
import { fetchPublicArticlesPage, type ArticleCursorPage } from "@/lib/api/blog";

export const metadata: Metadata = {
  title: "DDD 블로그 - 사이드 프로젝트 인사이트",
  description: "DDD 멤버들의 사이드 프로젝트 경험과 개발, 협업 인사이트를 공유합니다.",
};

export default async function BlogPage() {
  const { items, nextCursor, hasFailed } = await loadFirstPage();

  return (
    <>
      <Navigation />
      <main>
        <ArticleListPageSection
          initialItems={items}
          initialNextCursor={nextCursor}
          initialLoadFailed={hasFailed}
        />
      </main>
      <Footer />
    </>
  );
}

/*
  목록을 못 불러왔다고 /blog 를 통째로 에러 화면으로 떨어뜨리지 않는다.
  /project 와 같은 이유다 — 여기서 던지면 라우트 전체가 error.tsx 로 가고, 사용자는
  다시 시도해볼 기회조차 없다. 빈 목록과 안내로 넘겨 그 자리에서 재시도하게 둔다.
*/
async function loadFirstPage(): Promise<ArticleCursorPage & { hasFailed: boolean }> {
  try {
    const page = await fetchPublicArticlesPage({ limit: ARTICLE_LIST_PAGE_SIZE });
    return { ...page, hasFailed: false };
  } catch (error) {
    console.error("[blog] 목록 첫 페이지를 불러오지 못했다.", error);
    return { items: [], nextCursor: null, hasFailed: true };
  }
}
