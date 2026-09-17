import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectListPageSection } from "@/components/sections/ProjectListPageSection";
import { PROJECT_LIST_PAGE_SIZE } from "@/constants/projects";
import { fetchPublicProjectsPage, type ProjectCursorPage } from "@/lib/api/project";

export const metadata: Metadata = {
  title: "DDD 프로젝트 - 사이드 프로젝트 결과물 모음",
  description: "DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요.",
};

export default async function ProjectPage() {
  const { items, nextCursor, hasFailed } = await loadFirstPage();

  return (
    <>
      <Navigation />
      <main>
        <ProjectListPageSection
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
  목록을 못 불러왔다고 /project 를 통째로 에러 화면으로 떨어뜨리지 않는다.

  BE 장애든 응답 형태가 어긋난 경우든 여기서 던지면 라우트 전체가 error.tsx 로 가고,
  사용자는 탭 하나 눌러볼 기회도 없이 막힌다. 탭·페이지네이션은 클라이언트에서 다시
  요청하므로, 빈 목록과 안내 문구로 넘겨 그 자리에서 다시 시도하게 둔다.
  원인은 서버 로그로 남긴다.
*/
async function loadFirstPage(): Promise<ProjectCursorPage & { hasFailed: boolean }> {
  try {
    const page = await fetchPublicProjectsPage({ limit: PROJECT_LIST_PAGE_SIZE });
    return { ...page, hasFailed: false };
  } catch (error) {
    console.error("[project] 목록 첫 페이지를 불러오지 못했다.", error);
    return { items: [], nextCursor: null, hasFailed: true };
  }
}
