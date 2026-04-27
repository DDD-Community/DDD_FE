import { Avatar, Button, Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react"
import { OPERATIONS, CONTENTS } from "./constants"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import type { MenuItemType } from "./types"
import { Link, useLocation } from "react-router"
import { useEffect, useEffectEvent, useMemo, useState } from "react"

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const closeWhenPathChange = useEffectEvent(() => {
    setIsOpen(false)
  })

  const currentPageTitle = useMemo(() => {
    const allMenuItems = [...OPERATIONS, ...CONTENTS]
    const currentItem = allMenuItems.find(
      (item) => item.path === location.pathname
    )
    return currentItem ? currentItem.name : ""
  }, [location.pathname])

  useEffect(() => {
    closeWhenPathChange()
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-gray-100 px-4 py-2">
      <Button isIconOnly variant="outline" onPress={() => setIsOpen(true)}>
        <HanburgerIcon />
      </Button>

      <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <div className="size-8">
              <img src="/logo.png" alt="Logo" className="size-full" />
            </div>
            <Button isIconOnly variant="outline" onPress={() => setIsOpen(false)}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" />
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <MenuList />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <h1 className="text-gray-900">{currentPageTitle}</h1>
      <Avatar className="inline-flex size-8 items-center justify-center rounded-full bg-green-400 align-middle text-base text-white select-none">
        W
      </Avatar>
    </header>
  )
}

const MenuList = () => {
  return (
    <>
      <ul
        aria-label="운영"
        className="flex w-full flex-col gap-y-1.5 border-b p-4"
      >
        {OPERATIONS.map((item) => (
          <MenuItem key={item.name} item={item} />
        ))}
      </ul>

      <ul aria-label="콘텐츠" className="flex w-full flex-col gap-y-1.5 p-4">
        {CONTENTS.map((item) => (
          <MenuItem key={item.name} item={item} />
        ))}
      </ul>
    </>
  )
}
const MenuItem = ({ item }: { item: MenuItemType }) => {
  return (
    <li>
      <Link
        to={item.path}
        className="flex w-full items-center gap-x-3 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <HugeiconsIcon
          icon={item.icon}
          size={18}
          aria-hidden="true"
          className="shrink-0"
        />
        <span className="max-w-xs overflow-hidden whitespace-nowrap transition-all duration-300">
          {item.name}
        </span>
      </Link>
    </li>
  )
}

const HanburgerIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
      stroke="#141B34"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5L20 5" />
      <path d="M4 12L20 12" />
      <path d="M4 19L20 19" />
    </svg>
  )
}
