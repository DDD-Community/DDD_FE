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
 * 프로젝트는 미리보기 개수가 아니라 전부 받아온다. 이유가 두 가지다.
 *
 * 1. 탭 필터. 홈 섹션은 전체/iOS/Android/WEB 탭을 받은 목록 안에서 거른다.
 *    최신 3개만 넘기면 거기 없는 플랫폼 탭은 항상 비어 보인다.
 *    (2026-09 기준 최신 3개가 전부 iOS 라 WEB 탭이 비었다.) 3개로 자르는 건 섹션이 한다.
 *
 * 2. BE 우회. `GET /api/v1/projects` 는 결과가 잘려 `nextCursor` 를 만들어야 하면 500 을 낸다.
 *    (전체 9개일 때 `?limit=8` → 500, `?limit=9` → 200) 그래서 탭마다 `platform` 으로
 *    3개씩 따로 요청하는 방식도 지금은 쓸 수 없다.
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
