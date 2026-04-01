import { paths } from "@/lib/paths"
import {
  BellDot,
  Calendar01Icon,
  ComputerCloudIcon,
  LicenseDraftIcon,
  UserGroup02Icon,
} from "@hugeicons/core-free-icons"

export const OPERATIONS = [
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

export const CONTENTS = [
  {
    name: "프로젝트 관리",
    icon: ComputerCloudIcon,
    path: paths.projects,
  },
  { name: "블로그 관리", icon: LicenseDraftIcon, path: paths.blogPosts },
]
