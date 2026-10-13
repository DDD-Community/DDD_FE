import { Drawer } from "@heroui/react"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { AttendanceInvitationForm } from "./AttendanceInvitationForm"

interface Props {
  generationId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AttendanceInvitationDrawer({
  generationId,
  isOpen,
  onOpenChange,
}: Props) {
  const isMobile = useIsMobile()

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-md bg-gray-50" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              초대 코드 추가
            </Drawer.Heading>
          </Drawer.Header>
          {isOpen && (
            <AttendanceInvitationForm
              generationId={generationId}
              onDone={() => onOpenChange(false)}
            />
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
