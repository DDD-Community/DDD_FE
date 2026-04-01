import { Outlet } from "react-router"
import { SideBar } from "@/widgets/sidebar/SideBar"

/** 어드민 페이지 전체에서 사용하는 기본 레이아웃 */
export const AdminLayout = () => {
  return (
    <div className="flex h-screen w-screen">
      <SideBar />

      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
