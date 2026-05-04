import { Suspense, useState } from "react"
import { Button } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ErrorBoundary } from "react-error-boundary"
import type { BlogPostDto } from "@ddd/api"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { FlexBox } from "@/shared/ui/FlexBox"
import { TitleSection } from "@/widgets/heading"

import { BlogPostFormDrawer } from "./components/BlogPostFormDrawer"
import { BlogPostsList } from "./components/BlogPostsList"
import { BlogPostsTableSkeleton } from "./components/BlogPostsTableSkeleton"
import { BlogPostsToolbar } from "./components/BlogPostsToolbar"
import { DeleteBlogPostDialog } from "./components/DeleteBlogPostDialog"

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
      <FlexBox className="justify-between">
        <TitleSection
          title="블로그 관리"
          description="홈페이지에 노출되는 블로그 포스트를 등록하고 관리합니다."
        />
        <Button size="lg" onPress={handleCreate}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
          블로그 등록
        </Button>
      </FlexBox>

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <BlogPostsToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<BlogPostsTableSkeleton />}>
            <BlogPostsList
              searchText={searchText}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
        </ErrorBoundary>
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
