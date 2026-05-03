import { AlertDialog, Button, toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { projectKeys, useDeleteProject } from "@ddd/api"
import type { ProjectDto } from "@ddd/api"

type DeleteProjectDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectDto | null
}

export const DeleteProjectDialog = ({
  isOpen,
  onOpenChange,
  project,
}: DeleteProjectDialogProps) => {
  const queryClient = useQueryClient()
  const deleteProject = useDeleteProject()

  const handleConfirm = async () => {
    if (!project) return
    try {
      await deleteProject.mutateAsync({ params: { id: project.id } })
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      toast.success("프로젝트가 삭제되었습니다", {
        description: `'${project.name}'을(를) 제거했습니다.`,
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
              프로젝트를 삭제하시겠습니까?
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              <strong>{project?.name ?? ""}</strong>이(가) 영구적으로
              삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary">
              취소
            </Button>
            <Button
              variant="danger"
              isDisabled={deleteProject.isPending}
              onPress={handleConfirm}
            >
              {deleteProject.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
