import { Dropdown, Label } from "@heroui/react"
import type { ComponentProps, Key, ReactNode } from "react"
import { useLogoutFlow } from "@/entities/auth"

const MENU_ITEMS = [
  { id: "logout", label: "로그아웃", variant: "danger" as const },
] as const

type MenuItemId = (typeof MENU_ITEMS)[number]["id"]

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

  // 추후 메뉴 항목이 추가될 경우를 대비해 핸들러를 객체로 관리
  const handlers: Record<MenuItemId, () => void> = {
    logout: logoutAndRedirect,
  }

  const onAction = (key: Key) => {
    const handler = handlers[key as MenuItemId]
    handler?.()
  }

  return (
    <Dropdown>
      <Dropdown.Trigger className={className} aria-label={ariaLabel}>
        {children}
      </Dropdown.Trigger>
      <Dropdown.Popover placement={placement}>
        <Dropdown.Menu onAction={onAction} aria-label="사용자 메뉴">
          {MENU_ITEMS.map((item) => (
            <Dropdown.Item
              key={item.id}
              id={item.id}
              variant={item.variant}
              isDisabled={isPending}
              textValue={item.label}
            >
              <Label>{item.label}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
