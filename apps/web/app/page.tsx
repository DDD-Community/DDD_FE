import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { SponsorSection } from "@/components/sections/SponsorSection";
import { CtaSection } from "@/components/sections/CtaSection";
import type { ArticleItem } from "@/constants/articles";
import type { ProjectItem } from "@/constants/projects";
import { fetchPublicArticlesPage } from "@/lib/api/blog";
import { fetchPublicProjectsPage } from "@/lib/api/project";

const HOME_PREVIEW_LIMIT = 3;

/**
 * 프로젝트는 미리보기 개수가 아니라 전부 받아온다.
 *
 * 홈 섹션은 전체/iOS/Android/WEB 탭을 받은 목록 안에서 거른다. 최신 3개만 넘기면 거기
 * 없는 플랫폼 탭이 비거나 모자라 보인다. (2026-09 기준 전체 10개 중 최신 3개가
 * WEB 1 · iOS 2 라, 3개만 받으면 WEB 탭에 2개 중 1개만 뜬다.) 3개로 자르는 건 섹션이 한다.
 *
 * 탭마다 `platform` 으로 3개씩 따로 요청하면 이 상수를 지울 수 있다. 결과가 잘려
 * `nextCursor` 를 만들어야 하면 BE 가 500 을 내던 문제는 2026-09-17 해결을 확인했다.
 * 요청이 1번에서 4번으로 늘어나는 값을 지금 규모에서 치를 이유가 없어 두고 있다.
 */
const PROJECT_FETCH_LIMIT = 100;

export default async function HomePage() {
  const [projects, articles] = await Promise.all([loadProjectPreview(), loadArticlePreview()]);

  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection items={projects} />
        <BlogSection items={articles} />
        <FaqSection />
        <SponsorSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

/*
  미리보기 한 섹션을 못 불러왔다고 홈 전체를 에러 화면으로 떨어뜨리지 않는다.
  랜딩 페이지라 히어로·소개·FAQ 만으로도 제 역할을 하고, 여기서 던지면 사용자는
  사이트가 통째로 죽은 것으로 본다. 원인은 서버 로그로 남긴다.
*/
async function loadProjectPreview(): Promise<ProjectItem[]> {
  try {
    const { items } = await fetchPublicProjectsPage({ limit: PROJECT_FETCH_LIMIT });
    return items;
  } catch (error) {
    console.error("[home] 프로젝트 미리보기를 불러오지 못했다.", error);
    return [];
  }
}

async function loadArticlePreview(): Promise<ArticleItem[]> {
  try {
    const { items } = await fetchPublicArticlesPage({ limit: HOME_PREVIEW_LIMIT });
    return items;
  } catch (error) {
    console.error("[home] 블로그 미리보기를 불러오지 못했다.", error);
    return [];
  }
}
