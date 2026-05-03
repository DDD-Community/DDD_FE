import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeft01Icon } from "@hugeicons/core-free-icons"
import { Link, useLocation } from "react-router"
import { useToggle } from "react-simplikit"
import { Button, Avatar } from "@heroui/react"
import { OPERATIONS, CONTENTS } from "./constants"
import { UserMenuDropdown } from "./UserMenuDropdown"
import { FlexBox } from "@/shared/ui/FlexBox"
import type { MenuItemType } from "./types"

export const SideBar = () => {
  const [isOpen, toggle] = useToggle(true)

  return (
    <nav
      aria-label="사이드바 네비게이션"
      className={`overflow-hidden border-r py-2 transition-[width] duration-300 ease-in-out ${isOpen ? "w-56" : "w-18"}`}
    >
      <FlexBox
        direction="column"
        className="h-full w-full items-start justify-between"
      >
        <section className="w-full">
          <SideBarHeader isOpen={isOpen} toggle={toggle} />
          <MenuList isOpen={isOpen} />
        </section>

        <footer className="w-full border-t pt-2">
          <UserMenuDropdown
            placement={isOpen ? "top" : "right"}
            aria-label="사용자 메뉴"
            className="flex w-full items-center gap-x-4 rounded-lg px-4 py-2 font-medium hover:bg-gray-200"
          >
            <Avatar className="inline-flex size-10 items-center justify-center rounded-full bg-green-400 align-middle text-base text-white select-none">
              W
            </Avatar>
            <span
              className={`overflow-hidden whitespace-nowrap text-sm text-gray-900 transition-all duration-300 ${
                isOpen ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              User Name
            </span>
          </UserMenuDropdown>
        </footer>
      </FlexBox>
    </nav>
  )
}

type SideBarHeaderProps = {
  isOpen: boolean
  toggle: () => void
}

const SideBarHeader = ({ isOpen, toggle }: SideBarHeaderProps) => {
  return (
    <div className="flex items-start justify-between px-4">
      <div className="group relative size-10 shrink-0">
        <img
          src="/logo.png"
          alt="Logo"
          className={`size-full ${isOpen ? "" : "group-hover:opacity-0"}`}
        />
        {!isOpen && <OpenSideBarButton toggle={toggle} />}
      </div>
      <CloseSideBarButton isOpen={isOpen} toggle={toggle} />
    </div>
  )
}

const OpenSideBarButton = ({ toggle }: { toggle: () => void }) => {
  return (
    <Button
      isIconOnly
      variant="outline"
      onPress={toggle}
      aria-label="사이드바 열기"
      className="absolute inset-0 opacity-0 group-hover:opacity-100"
    >
      <HugeiconsIcon aria-hidden="true" icon={SidebarLeft01Icon} />
    </Button>
  )
}

const CloseSideBarButton = ({ isOpen, toggle }: SideBarHeaderProps) => {
  return (
    <Button
      isIconOnly
      variant="outline"
      aria-label="사이드바 닫기"
      onPress={toggle}
      isDisabled={!isOpen}
      className={`shrink-0 ${isOpen ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <HugeiconsIcon aria-hidden="true" icon={SidebarLeft01Icon} />
    </Button>
  )
}

const MenuList = ({ isOpen }: { isOpen: boolean }) => {
  const location = useLocation()
  return (
    <>
      <ul aria-label="운영" className="flex flex-col gap-y-1.5 border-b p-4">
        {OPERATIONS.map((item) => (
          <MenuItem
            key={item.name}
            item={item}
            isOpen={isOpen}
            isActive={location.pathname === item.path}
          />
        ))}
      </ul>

      <ul aria-label="콘텐츠" className="flex flex-col gap-y-1.5 p-4">
        {CONTENTS.map((item) => (
          <MenuItem
            key={item.name}
            item={item}
            isOpen={isOpen}
            isActive={location.pathname === item.path}
          />
        ))}
      </ul>
    </>
  )
}

type MenuItemProps = {
  item: MenuItemType
  isOpen: boolean
  isActive: boolean
}
const MenuItem = ({ item, isOpen, isActive }: MenuItemProps) => {
  return (
    <li>
      <Link
        to={item.path}
        aria-current={isActive ? "page" : undefined}
        className="flex w-full items-center gap-x-2 rounded-lg px-2.5 py-2 hover:bg-gray-200 data-[current=page]:bg-gray-300"
      >
        <HugeiconsIcon
          icon={item.icon}
          size={18}
          aria-hidden="true"
          className="shrink-0"
        />
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isOpen ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {item.name}
        </span>
      </Link>
    </li>
  )
}
