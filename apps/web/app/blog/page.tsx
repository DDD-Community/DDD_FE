import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ArticleListPageSection } from "@/components/sections/ArticleListPageSection";
import type { ArticleItem } from "@/constants/articles";
import { fetchAllPublicArticles } from "@/lib/api/blog";

export const metadata: Metadata = {
  title: "DDD 블로그 - 사이드 프로젝트 인사이트",
  description: "DDD 멤버들의 사이드 프로젝트 경험과 개발, 협업 인사이트를 공유합니다.",
};

export default async function BlogPage() {
  const { articles, hasFailed } = await loadArticles();

  return (
    <>
      <Navigation />
      <main>
        <ArticleListPageSection initialArticles={articles} initialLoadFailed={hasFailed} />
      </main>
      <Footer />
    </>
  );
}

/*
  첫 페이지가 아니라 목록 전부를 받는다. /project 와 같은 이유다 — BE 커서가 페이지
  경계에서 항목을 빠뜨려서(`lib/api/fetchAllPages` 참고) 커서를 타는 것 자체를 피한다.
  덤으로 브라우저가 페이지를 넘길 때 요청이 필요 없어지고 전체 페이지 수도 첫 화면부터
  정확히 나온다. 현재 12개 기준 gzip 으로 2.2KB 쯤 는다.

  목록을 못 불러왔다고 /blog 를 통째로 에러 화면으로 떨어뜨리지는 않는다. 여기서 던지면
  라우트 전체가 error.tsx 로 가고 사용자는 다시 시도해볼 기회조차 없다. 빈 목록과 안내로
  넘겨 그 자리에서 재시도하게 둔다.
*/
async function loadArticles(): Promise<{ articles: ArticleItem[]; hasFailed: boolean }> {
  try {
    return { articles: await fetchAllPublicArticles(), hasFailed: false };
  } catch (error) {
    console.error("[blog] 목록을 불러오지 못했다.", error);
    return { articles: [], hasFailed: true };
  }
}
