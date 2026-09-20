import type { Metadata } from "next";
import { PreAlertModal } from "@/components/modals/PreAlertModal";
import { RecruitStatusProvider } from "@/components/providers/RecruitStatusProvider";
import { getActiveCohort } from "@/lib/api/activeCohort.server";
import { getApiPreconnectOrigin } from "@/lib/api/config";
import { pretendard } from "./fonts";
import { getPreNotificationCohortName, parseRecruitStatus } from "@/lib/mappers/cohort";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * 모집 상태는 요청 시점에 조회한다.
 *
 * 루트 레이아웃이 렌더하는 Navigation CTA 가 모집 상태에 따라 바뀌므로, 이 레이아웃이
 * 정적으로 프리렌더되면 빌드 시점의 모집 상태가 모든 페이지 HTML 에 박제된다.
 * 실제로 어드민에서 14기를 "모집중" 으로 전환해도 배포 전까지 홈페이지가 계속
 * "사전 알림 신청" 을 노출하던 원인이 이것이다.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  /*
    메타데이터에 쓰는 상대 경로(OG 이미지 등)를 절대 URL 로 펴는 기준.
    이게 없으면 Next 가 배포 주소를 추측하고, 카카오톡·슬랙처럼 절대 URL 만 받는
    크롤러에서 링크 미리보기가 통째로 비어 보인다.
  */
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  /*
    `title`/`description` 을 여기 박지 않는다. 루트에 박으면 하위 페이지가 저마다
    지정한 제목을 덮어써서, 프로젝트 상세 링크를 공유해도 미리보기 제목이 전부
    사이트 기본값으로 나간다. 비워두면 각 페이지의 title/description 을 물려받는다.
  */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const activeCohort = await getActiveCohort();
  const recruitStatus = parseRecruitStatus(activeCohort);
  const apiOrigin = getApiPreconnectOrigin();

  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        {/*
          API 도메인에 미리 연결해둔다 (React 가 <head> 로 hoist 한다).
          지원서 인증번호 발송처럼 클릭 직후 나가는 요청이 핸드셰이크부터 시작하지
          않게 하려는 것이다. `use-credentials` 는 실제 요청(`credentials: "include"`)
          과 자격증명 모드를 맞추려는 것으로, anonymous 로 두면 브라우저가 다른
          커넥션 풀에 넣어 preconnect 한 소켓을 재사용하지 못한다.
        */}
        {apiOrigin ? (
          <link rel="preconnect" href={apiOrigin} crossOrigin="use-credentials" />
        ) : null}
        <RecruitStatusProvider recruitStatus={recruitStatus}>{children}</RecruitStatusProvider>
        <PreAlertModal cohortName={getPreNotificationCohortName(activeCohort)} />
      </body>
    </html>
  );
}
