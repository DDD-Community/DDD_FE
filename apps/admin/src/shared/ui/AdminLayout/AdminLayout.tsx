import { Navigate, Outlet } from "react-router"
import { Spinner } from "@heroui/react"
import { SideBar } from "./SideBar"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { useRequireAuth } from "@/shared/hooks/useRequireAuth"
import { paths } from "@/shared/lib/paths"
import { MobileHeader } from "./MobileHeader"
import { useGoogleCalendarCallbackToast } from "@/shared/hooks/useGoogleCalendarCallbackToast"

/** 어드민 페이지 전체에서 사용하는 기본 레이아웃 */
export const AdminLayout = () => {
  const isMobile = useIsMobile()
  const { status } = useRequireAuth()
  useGoogleCalendarCallbackToast()

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <Spinner aria-label="인증 확인 중" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to={paths.login} replace />
  }

  return (
    <div
      className={`flex h-screen w-screen bg-gray-100 ${isMobile ? "flex-col" : ""}`}
    >
      {isMobile ? <MobileHeader /> : <SideBar />}

      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
