import type { Metadata } from "next";
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ProjectListPageSection } from '@/components/sections/ProjectListPageSection';

export const metadata: Metadata = {
  title: "DDD 프로젝트 - 사이드 프로젝트 결과물 모음",
  description: "DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요.",
};

export default function ProjectPage() {
  return (
    <>
      <Navigation />
      <main>
        <ProjectListPageSection />
      </main>
      <Footer />
    </>
  );
}
