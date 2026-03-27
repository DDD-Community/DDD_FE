/**
 * 사이드바 컴포넌트 요구사항 정리
 * - 사이드바는 어드민 페이지의 주요 네비게이션 역할을 한다
 * - 2026/03/28 기준으로 사이드바에는 다음과 같은 메뉴가 포함되어야 한다
 * 운영:
 * - 기수 관리
 * - 사전 알림 신청
 * - 지원자 관리
 *
 * 콘텐츠
 * - 프로젝트 관리
 * - 블로그 관리
 *
 * 기능: 접었다 펼칠 수 있는 사이드바, 접었을때는 툴팁으로 아이콘 설명, 펼쳤을 때는 아이콘과 텍스트로 메뉴 설명
 * @returns JSX.Element
 */

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Calendar01Icon,
  BellDot,
  UserGroup02Icon,
  ComputerCloudIcon,
  LicenseDraftIcon,
  SidebarLeft01Icon,
  Check,
} from "@hugeicons/core-free-icons"
import { paths } from "@/lib/paths"
import { useLocation, useNavigate } from "react-router"
import { useToggle } from "react-simplikit"
import { Button } from "../ui/button"
import { Activity, useState } from "react"

const OPERATIONS = [
  {
    name: "기수 관리",
    icon: Calendar01Icon,
    path: paths.semesters,
  },
  { name: "사전 알림 신청", icon: BellDot, path: paths.reminders },
  {
    name: "지원자 관리",
    icon: UserGroup02Icon,
    path: paths.applications,
  },
]

const CONTENTS = [
  {
    name: "프로젝트 관리",
    icon: ComputerCloudIcon,
    path: paths.projects,
  },
  { name: "블로그 관리", icon: LicenseDraftIcon, path: paths.blogPosts },
]

/**
 * header 부분은 열리거나 닫히거나 상관없이 일정한 포지션을 유지하며,
 * 열렸을때는 토글 버튼이 사이드 오른쪽 끝에 위치
 * 닫혔을때는 header 부분에 호버했을때 아이콘이 열고닫기 버튼으로 바뀜. 그리고 그 상태에서 클릭하면 열림
 *
 * 메뉴 부분또한 마찬가지.
 * 메뉴의 사이드바가 열려있거나 닫혀있거나 메뉴 아이템 맨 왼쪽의 아이콘은 항상 같은 포지션을 유지,
 * 사이드바가 열렸을때는 옆에 텍스트와 체크 아이콘이 나타남(체크되어있다면)
 */
export const SideBar = () => {
  const [isOpen, toggle] = useToggle(true)

  return (
    <nav className={`border-r ${isOpen ? "w-64" : "w-20"}`}>
      <header
        className={`flex w-full items-center justify-between border-b py-2`}
      >
        <TransformButton onClick={toggle} />
      </header>

      <MenuList isOpen={isOpen} />
    </nav>
  )
}

const DDDLogo = () => {
  return <img src="/logo.png" alt="Logo" className="mx-2 h-8 w-8" />
}
const TransformButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ ...props }) => {
  const [showIcon, setShowIcon] = useState(false)

  return (
    <div
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
      className="px-4"
    >
      {showIcon ? (
        <Button variant="ghost" size="icon" className="p-0" {...props}>
          <HugeiconsIcon icon={SidebarLeft01Icon} size={20} />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="p-0">
          <DDDLogo />
        </Button>
      )}
    </div>
  )
}

const MenuList = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <>
      <ul className="flex flex-col gap-y-2 border-b p-4">
        {OPERATIONS.map((item) => (
          <MenuItem key={item.name} item={item} isOpen={isOpen} />
        ))}
      </ul>

      <ul className="flex flex-col gap-y-2 p-4">
        {CONTENTS.map((item) => (
          <MenuItem key={item.name} item={item} isOpen={isOpen} />
        ))}
      </ul>
    </>
  )
}

type MenuItem = {
  name: string
  icon: IconSvgElement
  path: string
}
const MenuItem = ({ item, isOpen }: { item: MenuItem; isOpen: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <li
      key={item.name}
      aria-checked={location.pathname === item.path}
      className="flex cursor-pointer items-center rounded-lg p-2 hover:bg-muted focus:bg-muted focus:outline-none"
      onClick={() => navigate(item.path)}
    >
      <div className="flex w-full justify-start gap-x-4">
        <HugeiconsIcon icon={item.icon} size={20} />
        <Activity mode={isOpen ? "visible" : "hidden"}>
          <div className="flex items-center gap-x-4">
            <span>{item.name}</span>
            {location.pathname === item.path && (
              <HugeiconsIcon
                icon={Check}
                size={16}
                className="ml-auto text-primary"
              />
            )}
          </div>
        </Activity>
      </div>
    </li>
  )
}
