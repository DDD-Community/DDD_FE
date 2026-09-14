import type { MetadataRoute } from "next";
import { isProductionDeployment, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  /*
    프리뷰 배포(`*.vercel.app`)는 통째로 막는다. 같은 내용이 두 주소로 색인되면 검색엔진이
    어느 쪽을 정본으로 볼지 흔들리고, 작업 중인 화면이 검색 결과로 새어 나간다.
    `VERCEL_ENV` 는 빌드 시점에 배포별로 주입되므로 이 분기는 배포마다 다르게 굳는다.
  */
  if (!isProductionDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    // `/api/` 는 PDF 프록시 같은 내부 경로라 크롤링할 이유가 없다.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
