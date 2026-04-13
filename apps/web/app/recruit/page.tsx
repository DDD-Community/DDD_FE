import type { Metadata } from "next";
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { RecruitHeroSection } from '@/components/sections/RecruitHeroSection';
import { RecruitRolesSection } from '@/components/sections/RecruitRolesSection';
import { RecruitScheduleSection } from '@/components/sections/RecruitScheduleSection';
import { RecruitCurriculumSection } from '@/components/sections/RecruitCurriculumSection';

export const metadata: Metadata = {
  title: "DDD 모집 - 사이드 프로젝트 멤버 지원",
  description: "DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다.",
};

export default function RecruitPage() {
  return (
    <>
      <Navigation />
      <main>
        <RecruitHeroSection />
        <RecruitRolesSection />
        <RecruitScheduleSection />
        <RecruitCurriculumSection />
      </main>
      <Footer />
    </>
  );
}
