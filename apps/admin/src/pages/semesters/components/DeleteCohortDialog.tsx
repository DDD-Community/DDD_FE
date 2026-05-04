import { AlertDialog, Button } from "@heroui/react"
import { useDeleteCohort } from "@ddd/api"

interface Props {
  targetId: number
  isOpen: boolean
  onClose: () => void
}

export function DeleteCohortDialog({ targetId, isOpen, onClose }: Props) {
  const { mutate: deleteCohort, isPending: isDeleting } = useDeleteCohort()

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-100">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>기수를 삭제하시겠습니까?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>작성 중인 모든 정보가 사라지며, 이 작업은 되돌릴 수 없습니다.</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary">
              취소
            </Button>
            <Button
              variant="danger"
              isDisabled={isDeleting}
              onPress={() => deleteCohort({ params: { id: targetId } })}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
