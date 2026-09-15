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
 * 프로젝트를 미리보기 개수가 아니라 넉넉히 받아오는 이유 — BE 우회.
 *
 * `GET /api/v1/projects` 는 결과가 잘려 `nextCursor` 를 만들어야 하면 500 을 낸다.
 * (2026-09 기준 전체 9개일 때 `?limit=8` → 500, `?limit=9` → 200)
 * 미리보기 3개만 달라고 하면 반드시 잘리므로, 홈 전체가 500 으로 떨어졌다.
 *
 * 잘릴 일이 없도록 한 번에 다 받아서 앞의 3개만 쓴다. BE 가 고쳐지면 이 상수를 지우고
 * `HOME_PREVIEW_LIMIT` 을 그대로 넘기면 된다.
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
    return items.slice(0, HOME_PREVIEW_LIMIT);
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
