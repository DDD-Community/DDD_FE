import type { MetadataRoute } from "next";
import { fetchPublicProjectsPage } from "@/lib/api/project";
import { SITE_URL } from "@/lib/site";

/*
  `/recruit/apply` 는 의도적으로 뺐다. 지원서 작성 폼이라 검색 유입 지점이 아니고,
  모집 기간 밖에는 열리지도 않아 색인해둬야 득이 없다.
*/
const STATIC_PATHS = ["", "/recruit", "/project", "/blog"] as const;

/** 커서 페이지네이션을 도는 횟수 상한. 프로젝트가 이 한도를 넘으면 값을 올린다. */
const MAX_PROJECT_PAGES = 20;

const PROJECT_PAGE_SIZE = 50;

/** sitemap 하나 만들자고 매 요청마다 프로젝트 전체를 훑을 이유는 없다. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = (await fetchAllProjectIds()).map((id) => ({
    url: `${SITE_URL}/project/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries];
}

/**
 * 공개 프로젝트 id 전체.
 *
 * API 가 응답하지 않아도 sitemap 생성 자체를 실패시키지는 않는다. 빌드 시점에 백엔드가
 * 잠깐 죽어 있다고 배포가 통째로 막히는 편이, 상세 페이지 몇 개가 빠진 sitemap 이
 * 나가는 것보다 손해가 크다.
 */
async function fetchAllProjectIds(): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;

  try {
    for (let page = 0; page < MAX_PROJECT_PAGES; page += 1) {
      const { items, nextCursor } = await fetchPublicProjectsPage({
        cursor,
        limit: PROJECT_PAGE_SIZE,
      });

      ids.push(...items.map((item) => item.id));

      if (!nextCursor) return ids;
      cursor = nextCursor;
    }
  } catch (error) {
    console.error("[sitemap] 프로젝트 목록 조회 실패 — 정적 경로만 내보낸다.", error);
    return [];
  }

  return ids;
}
