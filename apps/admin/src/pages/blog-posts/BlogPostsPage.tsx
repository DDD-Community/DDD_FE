import { useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useInfiniteBlogPosts } from "@ddd/api"
import type { BlogPostDto } from "@ddd/api"

import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import { BlogPostFormDrawer } from "./components/BlogPostFormDrawer"
import { BlogPostsToolbar } from "./components/BlogPostsToolbar"
import { BlogPostsTable } from "./components/BlogPostsTable"
import { DeleteBlogPostDialog } from "./components/DeleteBlogPostDialog"

const PAGE_LIMIT = 20

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; post: BlogPostDto }

/** 블로그 관리 페이지 */
export default function BlogPostsPage() {
  const [searchText, setSearchText] = useState("")
  const [drawerState, setDrawerState] = useState<DrawerState>({
    mode: "closed",
  })
  const [deleteTarget, setDeleteTarget] = useState<BlogPostDto | null>(null)

  const {
    data: postsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBlogPosts({ params: { limit: PAGE_LIMIT } })

  const allPosts = useMemo<BlogPostDto[]>(
    () => postsData?.pages.flatMap((page) => page.items) ?? [],
    [postsData]
  )

  const filteredPosts = useMemo(() => {
    if (searchText.length === 0) return allPosts
    return allPosts.filter((post) => post.title.includes(searchText))
  }, [allPosts, searchText])

  const handleCreate = () => setDrawerState({ mode: "create" })

  const handleEdit = (post: BlogPostDto) =>
    setDrawerState({ mode: "edit", post })

  const handleDelete = (post: BlogPostDto) => setDeleteTarget(post)

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setDrawerState({ mode: "closed" })
  }

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setDeleteTarget(null)
  }

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection onCreate={handleCreate} />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <BlogPostsToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />

        {isLoading ? (
          <EmptyState>불러오는 중...</EmptyState>
        ) : isError ? (
          <EmptyState tone="danger">
            블로그 목록을 불러오지 못했습니다.
          </EmptyState>
        ) : filteredPosts.length === 0 ? (
          <EmptyState>
            {allPosts.length === 0
              ? "등록된 블로그가 없습니다."
              : "조건에 맞는 블로그가 없습니다."}
          </EmptyState>
        ) : (
          <>
            <BlogPostsTable
              posts={filteredPosts}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
        )}
      </div>

      <BlogPostFormDrawer
        isOpen={drawerState.mode !== "closed"}
        onOpenChange={handleDrawerOpenChange}
        mode={drawerState.mode === "edit" ? "edit" : "create"}
        post={drawerState.mode === "edit" ? drawerState.post : undefined}
      />

      <DeleteBlogPostDialog
        isOpen={deleteTarget !== null}
        onOpenChange={handleDeleteOpenChange}
        post={deleteTarget}
      />
    </div>
  )
}

type TitleSectionProps = { onCreate: () => void }

const TitleSection = ({ onCreate }: TitleSectionProps) => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="블로그 관리" />
        <Description title="홈페이지에 노출되는 블로그 포스트를 등록하고 관리합니다." />
      </header>
      <Button size="lg" onPress={onCreate}>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        블로그 등록
      </Button>
    </FlexBox>
  )
}

type EmptyStateProps = {
  children: React.ReactNode
  tone?: "default" | "danger"
}

const EmptyState = ({ children, tone = "default" }: EmptyStateProps) => {
  return (
    <div
      className={
        tone === "danger"
          ? "py-12 text-center text-sm text-red-500"
          : "text-muted-foreground py-12 text-center text-sm"
      }
    >
      {children}
    </div>
  )
}
