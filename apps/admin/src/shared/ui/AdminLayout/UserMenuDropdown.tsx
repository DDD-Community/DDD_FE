import { Dropdown, Label } from "@heroui/react"
import type { ComponentProps, Key, ReactNode } from "react"
import { useLogoutFlow } from "@/shared/hooks/useLogoutFlow"
import { useGoogleCalendarConnectionFlow } from "@/shared/hooks/useGoogleCalendarConnectionFlow"

interface UserMenuDropdownProps {
  /** 트리거 버튼 내부에 표시할 시각 콘텐츠 (Avatar, 이름 등). 절대 <button>을 넘기지 말 것 — Dropdown.Trigger가 이미 button을 렌더한다. */
  children: ReactNode
  /** 트리거 버튼에 적용할 className */
  className?: string
  "aria-label"?: string
  placement?: ComponentProps<typeof Dropdown.Popover>["placement"]
}

export const UserMenuDropdown = ({
  children,
  className,
  "aria-label": ariaLabel,
  placement = "top",
}: UserMenuDropdownProps) => {
  const { logoutAndRedirect, isPending } = useLogoutFlow()
  const calendar = useGoogleCalendarConnectionFlow()
  const handlers: Record<string, () => void> = {
    connect: () => void calendar.connect(),
    disconnect: () => void calendar.disconnect(),
    logout: logoutAndRedirect,
  }

  const onAction = (key: Key) => {
    const handler = handlers[String(key)]
    handler?.()
  }

  return (
    <Dropdown>
      <Dropdown.Trigger className={className} aria-label={ariaLabel}>
        {children}
      </Dropdown.Trigger>
      <Dropdown.Popover placement={placement}>
        <Dropdown.Menu onAction={onAction} aria-label="사용자 메뉴">
          {calendar.status &&
            (calendar.status.status === "ACTIVE" ? (
              <>
                <Dropdown.Item
                  id="calendar-info"
                  textValue={`캘린더: ${calendar.status.googleEmail ?? "연결됨"}`}
                  isDisabled
                >
                  <Label>
                    캘린더: {calendar.status.googleEmail ?? "연결됨"}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item
                  id="connect"
                  textValue="Google 캘린더 다시 연결"
                  isDisabled={calendar.isPending}
                >
                  <Label>Google 캘린더 다시 연결</Label>
                </Dropdown.Item>
                <Dropdown.Item
                  id="disconnect"
                  textValue="Google 캘린더 연결 해제"
                  isDisabled={calendar.isPending}
                >
                  <Label>Google 캘린더 연결 해제</Label>
                </Dropdown.Item>
              </>
            ) : (
              <Dropdown.Item
                id="connect"
                textValue={
                  calendar.status.status === "INVALID"
                    ? "Google 캘린더 다시 연결 필요"
                    : "Google 캘린더 연결"
                }
                isDisabled={calendar.isPending}
              >
                <Label>
                  {calendar.status.status === "INVALID"
                    ? "Google 캘린더 다시 연결 필요"
                    : "Google 캘린더 연결"}
                </Label>
              </Dropdown.Item>
            ))}
          <Dropdown.Item
            id="logout"
            variant="danger"
            isDisabled={isPending}
            textValue="로그아웃"
          >
            <Label>로그아웃</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
