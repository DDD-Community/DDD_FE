import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { SidebarLeft01Icon } from "@hugeicons/core-free-icons"
import { Link, useLocation, useNavigate } from "react-router"
import { useToggle } from "react-simplikit"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Avatar } from "@/components/ui/avatar"
import { OPERATIONS, CONTENTS } from "./constants"
import { FlexBox } from "../FlexBox"

export const SideBar = () => {
  const [isOpen, toggle] = useToggle(true)

  return (
    <TooltipProvider delay={200}>
      <nav
        aria-label="사이드바 네비게이션"
        className={`border-r py-2 transition-[width] duration-300 ease-in-out ${isOpen ? "w-56" : "w-18"}`}
      >
        <FlexBox
          direction="column"
          className="h-full w-full items-start justify-between"
        >
          <section className="w-full">
            <SideBarHeader isOpen={isOpen} toggle={toggle} />
            <MenuList isOpen={isOpen} />
          </section>

          <footer className="flex w-full items-center gap-x-4 border-t px-4 pt-2 font-medium">
            <Avatar className="inline-flex size-10 items-center justify-center rounded-full bg-gray-100 align-middle text-base text-gray-900 select-none">
              W
            </Avatar>
            <span
              className={`text-sm whitespace-nowrap text-gray-900 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"} `}
            >
              User Name
            </span>
          </footer>
        </FlexBox>
      </nav>
    </TooltipProvider>
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
    <Tooltip>
      <TooltipTrigger
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        render={
          <Button onClick={toggle} variant="ghost" aria-label="사이드바 열기" />
        }
      >
        <HugeiconsIcon aria-hidden="true" icon={SidebarLeft01Icon} />
      </TooltipTrigger>
      <TooltipContent side="right">사이드바 열기</TooltipContent>
    </Tooltip>
  )
}

const CloseSideBarButton = ({ isOpen, toggle }: SideBarHeaderProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        tabIndex={isOpen ? 0 : -1}
        className={`shrink-0 ${isOpen ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"}`}
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="사이드바 닫기"
            onClick={toggle}
          />
        }
      >
        <HugeiconsIcon aria-hidden="true" icon={SidebarLeft01Icon} />
      </TooltipTrigger>
      <TooltipContent side="right">사이드바 닫기</TooltipContent>
    </Tooltip>
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

type MenuItemType = {
  name: string
  icon: IconSvgElement
  path: string
}

type MenuItemProps = {
  item: MenuItemType
  isOpen: boolean
  isActive: boolean
}
const MenuItem = ({ item, isOpen, isActive }: MenuItemProps) => {
  return (
    <li>
      <Tooltip disabled={isOpen}>
        <TooltipTrigger
          tabIndex={0}
          aria-current={isActive ? "page" : undefined}
          className="flex w-full items-center gap-x-2 rounded-lg px-2.5 py-2 hover:bg-muted"
          render={<Link to={item.path} />}
        >
          <HugeiconsIcon
            icon={item.icon}
            size={18}
            aria-hidden="true"
            className="shrink-0"
          />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.name}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    </li>
  )
}
