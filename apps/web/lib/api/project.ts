import { ApiError, projectAPI, type ProjectPlatform } from "@ddd/api";
import type { ProjectItem } from "@/constants/projects";
import { mapProject } from "@/lib/mappers/project";
import { ensureApiConfigured } from "./config";
import { fetchAllPages, MAX_LIMIT } from "./fetchAllPages";

export type ProjectCursorPage = {
  items: ProjectItem[];
  nextCursor: string | null;
};

export async function fetchPublicProjectsPage(options?: {
  cursor?: string;
  limit?: number;
  platform?: ProjectPlatform;
}): Promise<ProjectCursorPage> {
  ensureApiConfigured();
  const response = await projectAPI.getProjects({
    params: {
      cursor: options?.cursor,
      limit: options?.limit ?? 9,
      platform: options?.platform,
    },
  });
  return {
    items: response.items.map(mapProject),
    nextCursor: response.nextCursor ?? null,
  };
}

/**
 * 공개 프로젝트 전부.
 *
 * BE 커서 버그 때문에 한 번에 다 받는다 — 이유와 되돌리는 시점은 `fetchAllPages` 참고.
 * `MAX_LIMIT` 이 BE 가 받아주는 최댓값이라(101 부터 400) 현재 규모에선 요청 1번으로 끝난다.
 */
export async function fetchAllPublicProjects(options?: {
  platform?: ProjectPlatform;
}): Promise<ProjectItem[]> {
  return fetchAllPages(
    (cursor) => fetchPublicProjectsPage({ cursor, limit: MAX_LIMIT, platform: options?.platform }),
    "project",
  );
}

/** BE 가 "그런 프로젝트는 없다" 는 뜻으로 돌려주는 코드. */
const PROJECT_NOT_FOUND_CODES = new Set(["PROJECT_NOT_FOUND", "NOT_FOUND"]);

/** BE 의 프로젝트 id 는 int32 다. */
const MAX_PROJECT_ID = 2_147_483_647;

/**
 * 경로의 id 를 BE 에 보낼 수 있는 값으로 좁힌다.
 *
 * `/project/abc` 처럼 숫자가 아닌 경로는 `Number()` 가 NaN 을 만들어 BE 까지 갔다가
 * 400 으로 돌아온다. 존재할 수 없는 주소이므로 요청을 보내지 않고 없는 것으로 본다.
 *
 * int32 를 넘는 값도 여기서 막는다. 그대로 넘기면 BE 가 404 가 아니라 500 을 돌려주고,
 * 그게 그대로 우리 500 이 된다. 범위를 벗어난 id 는 애초에 없는 프로젝트다.
 */
function toProjectId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= MAX_PROJECT_ID ? id : null;
}

/**
 * 프로젝트 상세. 없는 프로젝트면 `null` 이고, 호출부는 404 로 떨어뜨린다.
 *
 * 없는 id 를 404 가 아니라 500 으로 돌려주고 있었다. BE 의 404 가 ApiError 로 던져지는데
 * 아무도 잡지 않아 페이지 렌더가 통째로 실패했고, 화면에는 Next 의 "Application error"
 * 가 떴다. 그래서 `notFound()` 는 한 번도 실행되지 못했다.
 *
 * 못 찾은 경우만 null 로 흡수하고 나머지는 그대로 던진다. BE 장애까지 404 로 덮으면
 * 멀쩡한 프로젝트 주소가 "없는 페이지" 로 보이고, 검색엔진에도 그렇게 수집된다.
 */
export async function fetchPublicProjectById(id: string): Promise<ProjectItem | null> {
  const projectId = toProjectId(id);
  if (projectId === null) return null;

  ensureApiConfigured();

  try {
    const response = await projectAPI.getProject({ params: { id: projectId } });
    return mapProject(response);
  } catch (error) {
    if (error instanceof ApiError && PROJECT_NOT_FOUND_CODES.has(error.code)) return null;
    throw error;
  }
}
