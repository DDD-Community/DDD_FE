import { Drawer } from "@heroui/react"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { AttendanceTeamForm } from "./AttendanceTeamForm"

interface Props {
  generationId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AttendanceTeamDrawer({
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
              팀 추가
            </Drawer.Heading>
          </Drawer.Header>
          {isOpen && (
            <AttendanceTeamForm
              generationId={generationId}
              onDone={() => onOpenChange(false)}
            />
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
