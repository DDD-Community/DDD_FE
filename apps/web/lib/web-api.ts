import { configureApi, webApi } from "@ddd/api";
import { ApiError } from "@ddd/api";
import type { ArticleItem } from "@/constants/articles";
import type { ProjectItem } from "@/constants/projects";
import { articles as fallbackArticles } from "@/constants/articles";
import { projects as fallbackProjects } from "@/constants/projects";
import type { RecruitStatus } from "@/constants/recruit";

type JsonObject = Record<string, unknown>;

function ensureApiConfigured() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined);
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }
  configureApi(baseUrl);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toProjectCategory(platforms: unknown): ProjectItem["category"] {
  if (!Array.isArray(platforms) || platforms.length === 0) return "WEB";
  const raw = String(platforms[0]).toUpperCase();
  if (raw === "IOS") return "iOS";
  if (raw === "AOS") return "AOS";
  return "WEB";
}

function mapProject(item: unknown): ProjectItem | null {
  if (!isObject(item)) return null;

  const id = item.id;
  const title = item.name;
  const description = item.description;
  if (typeof id !== "number" || typeof title !== "string" || typeof description !== "string") {
    return null;
  }

  const participants = Array.isArray(item.members)
    ? item.members
        .map((member) => {
          if (!isObject(member)) return null;
          const name = toStringValue(member.name);
          const role = toStringValue(member.part);
          if (!name || !role) return null;
          return { name, role };
        })
        .filter((member): member is { name: string; role: string } => Boolean(member))
    : [];

  return {
    id: String(id),
    title,
    description,
    category: toProjectCategory(item.platforms),
    generation: toStringValue(item.cohortName, "DDD"),
    thumbnail: toStringValue(item.thumbnailUrl),
    banner: toStringValue(item.thumbnailUrl),
    pdf: toStringValue(item.pdfUrl),
    detailTitle: title,
    longDescription: description,
    participants,
  };
}

type ProjectPlatform = "IOS" | "AOS" | "WEB";

function mapPlatformToCategory(platform?: ProjectPlatform): ProjectItem["category"] | null {
  if (!platform) return null;
  if (platform === "IOS") return "iOS";
  if (platform === "AOS") return "AOS";
  return "WEB";
}

function mapArticle(item: unknown): ArticleItem | null {
  if (!isObject(item)) return null;
  const id = item.id;
  const title = item.title;
  const description = toStringValue(item.excerpt, toStringValue(item.description));
  if (typeof id !== "number" || typeof title !== "string" || !description) {
    return null;
  }

  const thumbnail = toStringValue(
    item.thumbnail,
    toStringValue(item.thumbnailUrl, toStringValue(item.imageUrl)),
  );

  return {
    id: String(id),
    title,
    description,
    thumbnail,
  };
}

export async function fetchPublicProjects(): Promise<ProjectItem[]> {
  try {
    ensureApiConfigured();
    const response = await webApi.getProjects({ limit: 100 });
    const items = Array.isArray(response.items) ? response.items : [];
    const mapped = items.map(mapProject).filter((item): item is ProjectItem => Boolean(item));
    return mapped.length > 0 ? mapped : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

export type ProjectCursorPage = {
  items: ProjectItem[];
  nextCursor: string | null;
};

export async function fetchPublicProjectsPage(options?: {
  cursor?: string;
  limit?: number;
  platform?: ProjectPlatform;
}): Promise<ProjectCursorPage> {
  try {
    ensureApiConfigured();
    const response = await webApi.getProjects({
      cursor: options?.cursor,
      limit: options?.limit ?? 9,
      platform: options?.platform,
    });
    const items = Array.isArray(response.items) ? response.items : [];
    const mapped = items.map(mapProject).filter((item): item is ProjectItem => Boolean(item));
    const nextCursor =
      typeof response.nextCursor === "string" && response.nextCursor ? response.nextCursor : null;

    if (mapped.length > 0) {
      return { items: mapped, nextCursor };
    }

    const fallbackCategory = mapPlatformToCategory(options?.platform);
    const fallback = fallbackCategory
      ? fallbackProjects.filter((project) => project.category === fallbackCategory)
      : fallbackProjects;
    return { items: fallback, nextCursor: null };
  } catch {
    const fallbackCategory = mapPlatformToCategory(options?.platform);
    const fallback = fallbackCategory
      ? fallbackProjects.filter((project) => project.category === fallbackCategory)
      : fallbackProjects;
    return { items: fallback, nextCursor: null };
  }
}

export async function fetchPublicProjectById(id: string): Promise<ProjectItem | null> {
  try {
    ensureApiConfigured();
    const response = await webApi.getProjectById(Number(id));
    return mapProject(response);
  } catch {
    return fallbackProjects.find((project) => project.id === id) ?? null;
  }
}

export async function fetchPublicArticles(): Promise<ArticleItem[]> {
  try {
    ensureApiConfigured();
    const response = await webApi.getBlogPosts({ limit: 100 });
    const items = Array.isArray(response.items) ? response.items : [];
    const mapped = items.map(mapArticle).filter((item): item is ArticleItem => Boolean(item));
    return mapped.length > 0 ? mapped : [...fallbackArticles];
  } catch {
    return [...fallbackArticles];
  }
}

export type ArticleCursorPage = {
  items: ArticleItem[];
  nextCursor: string | null;
};

export async function fetchPublicArticlesPage(
  options?: { cursor?: string; limit?: number },
): Promise<ArticleCursorPage> {
  try {
    ensureApiConfigured();
    const response = await webApi.getBlogPosts({
      cursor: options?.cursor,
      limit: options?.limit ?? 4,
    });

    const items = Array.isArray(response.items) ? response.items : [];
    const mapped = items.map(mapArticle).filter((item): item is ArticleItem => Boolean(item));
    const nextCursor = typeof response.nextCursor === "string" && response.nextCursor
      ? response.nextCursor
      : null;

    return {
      items: mapped.length > 0 ? mapped : [...fallbackArticles],
      nextCursor,
    };
  } catch {
    return { items: [...fallbackArticles], nextCursor: null };
  }
}

export async function subscribeEarlyNotification(email: string, cohortId = 1): Promise<void> {
  ensureApiConfigured();
  await webApi.subscribeEarlyNotification({ email, cohortId });
}

function parseRecruitStatusFromActiveCohort(payload: unknown): RecruitStatus {
  if (!isObject(payload)) return "closed";

  const ctaStatus = toStringValue(payload.ctaButtonStatus).toUpperCase();
  if (ctaStatus) {
    if (["APPLY", "OPEN", "RECRUIT_OPEN", "ENABLED"].includes(ctaStatus)) return "open";
    if (["NOTIFY", "CLOSED", "DISABLED"].includes(ctaStatus)) return "closed";
  }

  const status = toStringValue(payload.status, toStringValue(payload.cohortStatus)).toUpperCase();
  if (status.includes("RECRUIT")) return "open";
  return "closed";
}

function parseActiveCohortId(payload: unknown): number | null {
  if (!isObject(payload)) return null;
  const id = payload.id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  const cohortId = payload.cohortId;
  if (typeof cohortId === "number" && Number.isFinite(cohortId)) return cohortId;
  return null;
}

export async function fetchRecruitStatus(): Promise<RecruitStatus> {
  try {
    ensureApiConfigured();
    const response = await webApi.getActiveCohort();
    return parseRecruitStatusFromActiveCohort(response);
  } catch {
    return "closed";
  }
}

export async function fetchActiveCohortId(): Promise<number | null> {
  try {
    ensureApiConfigured();
    const response = await webApi.getActiveCohort();
    return parseActiveCohortId(response);
  } catch {
    return null;
  }
}

export async function subscribeEarlyNotificationWithActiveCohort(email: string): Promise<void> {
  const activeCohortId = await fetchActiveCohortId();
  if (!activeCohortId) {
    throw new ApiError(
      "BAD_REQUEST",
      "활성 기수 정보를 찾지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
  await subscribeEarlyNotification(email, activeCohortId);
}
