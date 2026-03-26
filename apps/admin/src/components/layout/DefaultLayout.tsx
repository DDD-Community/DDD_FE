import { Outlet } from "react-router"

/** 어드민 페이지 전체에서 사용하는 기본 레이아웃 */
export const DefaultLayout = () => {
  return (
    <div className="flex h-screen w-screen">
      <nav className="w-64 border-r" />

      <div className="flex flex-1 flex-col">
        <header className="h-16 w-full border-b" />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="h-16 w-full border-t" />
      </div>
    </div>
  )
}
