import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RecruitApplySection } from "@/components/sections/RecruitApplySection";
import { getActiveCohort } from "@/lib/api/activeCohort.server";
import { parseRecruitStatus } from "@/lib/mappers/cohort";

export const metadata: Metadata = {
  // 루트 레이아웃의 `template: "%s | DDD"` 가 접미사를 붙인다. 여기에 또 적으면
  // "DDD 지원서 | DDD | DDD" 가 된다.
  title: "DDD 지원서",
  description: "DDD 14기 지원서 페이지입니다.",
};

/*
  모집 중이 아니면 지원서를 열지 않고 /recruit 로 보낸다.

  CTA 는 모집 중일 때만 이 주소를 가리키지만, 그때 공유된 링크는 모집이 끝난 뒤에도
  살아 있다. 그대로 두면 뒤늦게 링크를 누른 사람이 기본 정보와 이메일 인증을 모두
  마친 뒤에야 막힌다. 모집 상태는 페이지를 여는 시점에 이미 알 수 있으므로 여기서 끊는다.

  조회에 실패했을 때(= `null`) 는 막지 않는다. 실패와 "모집 아님" 은 같은 값으로
  떨어지는데(mappers/cohort 참고), 그걸 막는 쪽으로 해석하면 BE 장애 한 번에 모집
  기간 내내 지원이 닫힌다. 확실히 모집이 아닐 때만 끊고, 나머지는 통과시켜 지원 파트
  단계의 방어와 BE 검증에 맡긴다.

  `getActiveCohort` 는 요청 단위로 캐시되어 루트 레이아웃의 CTA 조회와 합쳐진다.
*/
export default async function RecruitApplyPage() {
  const activeCohort = await getActiveCohort();
  if (activeCohort && parseRecruitStatus(activeCohort) !== "open") redirect("/recruit");

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
