import { Drawer } from "@heroui/react"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { AttendanceGenerationForm } from "./AttendanceGenerationForm"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AttendanceGenerationDrawer({ isOpen, onOpenChange }: Props) {
  const isMobile = useIsMobile()

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-md bg-gray-50" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              출석앱 기수 추가
            </Drawer.Heading>
          </Drawer.Header>
          {isOpen && (
            <AttendanceGenerationForm onDone={() => onOpenChange(false)} />
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
