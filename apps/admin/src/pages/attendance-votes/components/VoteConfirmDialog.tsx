import { AlertDialog, Button } from "@heroui/react"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
  confirmVariant: "primary" | "danger"
  iconStatus: React.ComponentProps<typeof AlertDialog.Icon>["status"]
  isPending: boolean
  onConfirm: () => void
}

export function VoteConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmVariant,
  iconStatus,
  isPending,
  onConfirm,
}: Props) {
  // 요청 중에는 닫지 못하게 한다. 닫아도 요청은 계속돼 결과를 놓친다.
  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (open || !isPending) onOpenChange(open)
      }}
      isDismissable={!isPending}
      isKeyboardDismissDisabled={isPending}
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-100">
          {!isPending && <AlertDialog.CloseTrigger />}
          <AlertDialog.Header>
            <AlertDialog.Icon status={iconStatus} />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{description}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isPending}>
              취소
            </Button>
            <Button
              variant={confirmVariant}
              isDisabled={isPending}
              onPress={onConfirm}
            >
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
