// 임시 타입들, API 명세 보고 수정 필요

export type BlogPostStatus = "published" | "draft" | "archived"

export type BlogPostInfo = {
  id: string
  title: string
  author: string
  category: string
  status: BlogPostStatus
  publishedAt: string
  createdAt: string
}
