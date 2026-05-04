import { useMemo } from "react"
import { Button } from "@heroui/react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

import { blogQueries, type BlogPostDto } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { FlexBox } from "@/shared/ui/FlexBox"

import { BlogPostsTable } from "./BlogPostsTable"

const PAGE_LIMIT = 20

type BlogPostsListProps = {
  searchText: string
  onEdit: (post: BlogPostDto) => void
  onDelete: (post: BlogPostDto) => void
}

export const BlogPostsList = ({
  searchText,
  onEdit,
  onDelete,
}: BlogPostsListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      blogQueries.getAdminInfiniteBlogPosts({ params: { limit: PAGE_LIMIT } })
    )

  const allPosts = useMemo<BlogPostDto[]>(
    () => data.pages.flatMap((page) => page.items).filter(Boolean),
    [data]
  )

  const filteredPosts = useMemo(() => {
    if (searchText.length === 0) return allPosts
    return allPosts.filter((post) => post.title.includes(searchText))
  }, [allPosts, searchText])

  if (filteredPosts.length === 0) {
    return (
      <EmptyState>
        {allPosts.length === 0
          ? "등록된 블로그가 없습니다."
          : "조건에 맞는 블로그가 없습니다."}
      </EmptyState>
    )
  }

  return (
    <>
      <BlogPostsTable
        posts={filteredPosts}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <FlexBox className="justify-between pt-2">
        <span className="text-muted-foreground text-xs">
          현재 {filteredPosts.length}개 표시
          {hasNextPage ? " · 더 있음" : ""}
        </span>
        {hasNextPage && (
          <Button
            size="sm"
            variant="outline"
            onPress={() => fetchNextPage()}
            isDisabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
          </Button>
        )}
      </FlexBox>
    </>
  )
}
