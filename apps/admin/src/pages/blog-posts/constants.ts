import type { BlogPostStatus } from "./types"

export const STATUS_LABEL: Record<BlogPostStatus, string> = {
  published: "게시됨",
  draft: "임시저장",
  archived: "보관됨",
}

export const STATUS_FILTER_OPTIONS = ["전체", "게시됨", "임시저장", "보관됨"]

export const STATUS_FILTER_MAP: Record<string, BlogPostStatus | null> = {
  전체: null,
  게시됨: "published",
  임시저장: "draft",
  보관됨: "archived",
}
