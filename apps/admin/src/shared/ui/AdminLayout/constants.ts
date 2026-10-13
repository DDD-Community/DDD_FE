import { paths } from "@/shared/lib/paths"
import {
  BellDot,
  ChartLineData02Icon,
  Calendar01Icon,
  Calendar03Icon,
  CodeIcon,
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
  {
    name: "면접 슬롯",
    icon: Calendar03Icon,
    path: paths.interviewSlots,
  },
  { name: "출석 코드 관리", icon: CodeIcon, path: paths.attendanceCodes },
  {
    name: "출석 현황",
    icon: ChartLineData02Icon,
    path: paths.attendanceBoard,
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
