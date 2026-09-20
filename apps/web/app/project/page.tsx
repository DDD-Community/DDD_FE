import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectListPageSection } from "@/components/sections/ProjectListPageSection";
import type { ProjectItem } from "@/constants/projects";
import { fetchAllPublicProjects } from "@/lib/api/project";

export const metadata: Metadata = {
  title: "DDD 프로젝트 - 사이드 프로젝트 결과물 모음",
  description: "DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요.",
};

export default async function ProjectPage() {
  const { projects, hasFailed } = await loadProjects();

  return (
    <>
      <Navigation />
      <main>
        <ProjectListPageSection initialProjects={projects} initialLoadFailed={hasFailed} />
      </main>
      <Footer />
    </>
  );
}

/*
  첫 페이지가 아니라 "전체" 탭 목록 전부를 받는다.

  BE 커서가 페이지 경계에서 항목을 빠뜨려서(`fetchAllPublicProjects` 주석 참고) 커서를
  타는 것 자체를 피해야 한다. 덤으로 브라우저가 페이지를 넘길 때 요청이 필요 없어지고,
  전체 페이지 수도 첫 화면부터 정확히 나온다. 현재 23개 기준 gzip 으로 1.6KB 쯤 는다.

  목록을 못 불러왔다고 /project 를 통째로 에러 화면으로 떨어뜨리지는 않는다. 여기서
  던지면 라우트 전체가 error.tsx 로 가고 사용자는 탭 하나 눌러볼 기회도 없이 막힌다.
  빈 목록과 안내 문구로 넘겨 그 자리에서 다시 시도하게 둔다. 원인은 서버 로그로 남긴다.
*/
async function loadProjects(): Promise<{ projects: ProjectItem[]; hasFailed: boolean }> {
  try {
    return { projects: await fetchAllPublicProjects(), hasFailed: false };
  } catch (error) {
    console.error("[project] 목록을 불러오지 못했다.", error);
    return { projects: [], hasFailed: true };
  }
}
