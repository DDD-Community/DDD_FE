import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RecruitApplySection } from "@/components/sections/RecruitApplySection";

export const metadata: Metadata = {
  title: "DDD 지원서 | DDD",
  description: "DDD 13기 지원서 페이지입니다.",
};

export default function RecruitApplyPage() {
  return (
    <>
      <Navigation />
      <main>
        <RecruitApplySection />
      </main>
      <Footer />
    </>
  );
}
