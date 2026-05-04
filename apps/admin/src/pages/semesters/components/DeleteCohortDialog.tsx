import { AlertDialog, Button } from "@heroui/react"

import type { CohortDto } from "@ddd/api"

import { useDeleteCohortFlow } from "@/entities/cohort"

interface Props {
  cohort: Pick<CohortDto, "id" | "name">
  isOpen: boolean
  onClose: () => void
}

export function DeleteCohortDialog({ cohort, isOpen, onClose }: Props) {
  const { remove, isPending: isDeleting } = useDeleteCohortFlow({
    onSuccess: onClose,
  })

  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={onClose}
      isKeyboardDismissDisabled={false}
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>기수를 삭제하시겠습니까?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>작성 중인 모든 정보가 사라지며, 이 작업은 되돌릴 수 없습니다.</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="outline">
              취소
            </Button>
            <Button
              variant="danger"
              isDisabled={isDeleting}
              onPress={() => remove(cohort)}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
