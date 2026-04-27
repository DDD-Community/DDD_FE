import type { Metadata } from 'next';
import { PreAlertModal } from '@/components/modals/PreAlertModal';
import { RecruitStatusProvider } from "@/components/providers/RecruitStatusProvider";
import { fetchRecruitStatus } from "@/lib/web-api";
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티',
    template: '%s | DDD',
  },
  description:
    '개발자, 디자이너, 기획자가 함께 사이드 프로젝트를 만들고 성장하는 커뮤니티 DDD. 실전 협업 경험을 쌓아보세요.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const recruitStatus = await fetchRecruitStatus();

  return (
    <html lang="ko">
      <body>
        <RecruitStatusProvider recruitStatus={recruitStatus}>{children}</RecruitStatusProvider>
        <PreAlertModal />
      </body>
    </html>
  );
}
