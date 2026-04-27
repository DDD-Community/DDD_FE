import { Outlet } from "react-router"
import { SideBar } from "@/widgets/navigation/SideBar"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { MobileHeader } from "../navigation/MobileHeader"

/** 어드민 페이지 전체에서 사용하는 기본 레이아웃 */
export const AdminLayout = () => {
  const isMobile = useIsMobile()

  return (
    <div className={`flex h-screen w-screen bg-gray-100 ${isMobile ? "flex-col" : ""}`}>
      {isMobile ? <MobileHeader /> : <SideBar />}

      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
