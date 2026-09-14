/**
 * 사이트 정본 주소(canonical origin).
 *
 * 메타데이터의 상대 경로를 절대 URL 로 펴는 기준이자 sitemap·robots 가 내보내는 주소의
 * 출처다. 프리뷰 배포도 자기 주소가 아니라 이 값을 쓴다 — 프리뷰는 어차피 색인 대상이
 * 아니고(robots.ts 가 막는다), OG 이미지는 프로덕션 자산을 가리키는 편이 안전하다.
 */
export const SITE_URL = "https://dddstudy.kr";

export const SITE_NAME = "DDD";

export const SITE_TITLE = "DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티";

export const SITE_DESCRIPTION =
  "개발자, 디자이너, 기획자가 함께 사이드 프로젝트를 만들고 성장하는 커뮤니티 DDD. 실전 협업 경험을 쌓아보세요.";

/**
 * Vercel 프로덕션 배포인지.
 *
 * `VERCEL_ENV` 는 Vercel 이 자동 주입하는 시스템 환경변수라 별도 설정이 필요 없다.
 * 프리뷰 배포와 로컬에서는 모두 false 가 되어 색인을 막는다.
 */
export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}
