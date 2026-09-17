import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RecruitApplySection } from "@/components/sections/RecruitApplySection";

export const metadata: Metadata = {
  // 루트 레이아웃의 `template: "%s | DDD"` 가 접미사를 붙인다. 여기에 또 적으면
  // "DDD 지원서 | DDD | DDD" 가 된다.
  title: "DDD 지원서",
  description: "DDD 14기 지원서 페이지입니다.",
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
