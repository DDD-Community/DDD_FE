import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RecruitHeroSection } from "@/components/sections/RecruitHeroSection";
import { RecruitRolesSection } from "@/components/sections/RecruitRolesSection";
import { RecruitScheduleSection } from "@/components/sections/RecruitScheduleSection";
import { RecruitCurriculumSection } from "@/components/sections/RecruitCurriculumSection";
import { recruitPageMetaDescriptionByStatus } from "@/constants/recruit";
import { fetchRecruitStatus } from "@/lib/web-api";

export async function generateMetadata(): Promise<Metadata> {
  const recruitStatus = await fetchRecruitStatus();
  return {
    title: "DDD 모집 - 사이드 프로젝트 멤버 지원",
    description: recruitPageMetaDescriptionByStatus[recruitStatus],
  };
}

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
