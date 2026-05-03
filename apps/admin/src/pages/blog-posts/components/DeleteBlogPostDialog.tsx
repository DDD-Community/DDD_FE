import { AlertDialog, Button, toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { blogKeys, useDeleteBlogPost } from "@ddd/api"
import type { BlogPostDto } from "@ddd/api"

type DeleteBlogPostDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  post: BlogPostDto | null
}

export const DeleteBlogPostDialog = ({
  isOpen,
  onOpenChange,
  post,
}: DeleteBlogPostDialogProps) => {
  const queryClient = useQueryClient()
  const deleteBlogPost = useDeleteBlogPost()

  const handleConfirm = async () => {
    if (!post) return
    try {
      await deleteBlogPost.mutateAsync({ params: { id: post.id } })
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success("블로그가 삭제되었습니다", {
        description: `'${post.title}'을(를) 제거했습니다.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.danger("삭제에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-[400px]">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>
              블로그를 삭제하시겠습니까?
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              <strong>{post?.title ?? ""}</strong>이(가) 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary">
              취소
            </Button>
            <Button
              variant="danger"
              isDisabled={deleteBlogPost.isPending}
              onPress={handleConfirm}
            >
              {deleteBlogPost.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
