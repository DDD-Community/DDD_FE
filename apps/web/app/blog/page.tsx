import type { Metadata } from "next";
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ArticleListPageSection } from '@/components/sections/ArticleListPageSection';

export const metadata: Metadata = {
  title: "DDD 블로그 - 사이드 프로젝트 인사이트",
  description: "DDD 멤버들의 사이드 프로젝트 경험과 개발, 협업 인사이트를 공유합니다.",
};

export default function BlogPage() {
  return (
    <>
      <Navigation />
      <main>
        <ArticleListPageSection />
      </main>
      <Footer />
    </>
  );
}
