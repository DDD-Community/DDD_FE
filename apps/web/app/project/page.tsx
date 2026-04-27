import type { Metadata } from "next";
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ProjectListPageSection } from '@/components/sections/ProjectListPageSection';
import { fetchPublicProjectsPage } from '@/lib/web-api';

export const metadata: Metadata = {
  title: "DDD 프로젝트 - 사이드 프로젝트 결과물 모음",
  description: "DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요.",
};

export default async function ProjectPage() {
  const { items, nextCursor } = await fetchPublicProjectsPage({ limit: 9 });
  console.log("[ProjectPage] projects page data", { count: items.length, nextCursor, items });

  return (
    <>
      <Navigation />
      <main>
        <ProjectListPageSection initialItems={items} initialNextCursor={nextCursor} />
      </main>
      <Footer />
    </>
  );
}
