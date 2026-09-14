/**
 * 프로젝트 카테고리 — 값은 BE 의 `platform` 과 같은 철자를 쓴다.
 *
 * `toApiPlatform` 이 "iOS" 를 뺀 나머지를 그대로 API 로 넘기고, 응답 매퍼도 같은 값으로
 * 되돌린다. 그래서 이 값을 화면에 보여줄 문구에 맞춰 바꾸면 필터가 조용히 깨진다.
 * 보여줄 문구는 `PROJECT_CATEGORY_LABELS` 로 따로 둔다.
 */
export type ProjectCategory = "전체" | "iOS" | "AOS" | "WEB";

/** 화면에 표시할 문구. 값(AOS)과 표기(Android)가 다른 건 이것뿐이다. */
export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  전체: "전체",
  iOS: "iOS",
  AOS: "Android",
  WEB: "WEB",
};

export const PROJECT_CATEGORY_TABS: ProjectCategory[] = ["전체", "iOS", "AOS", "WEB"];

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: Exclude<ProjectCategory, "전체">;
  generation: string;
  banner: string;
  pdf: string;
  detailTitle: string;
  longDescription: string;
  participants: Array<{ name: string; role: string }>;
};
