import { createBrowserRouter, RouterProvider } from "react-router"
import Login from "./pages/Login"
import Applications from "./pages/Applications"
import Semesters from "./pages/Semesters"
import Reminders from "./pages/Reminders"
import { ErrorPage } from "./pages/Error"

/** 라우터 설정 (리액트 라우터 Data Mode 기반) */
const router = createBrowserRouter([
  {
    path: "/",
    // 해당 라우트에 매칭되는 UI 컴포넌트(페이지)
    element: <Login />,
    loader: async () => {
      // 페인트 전 단계에 실행되어 초기에 필요한 데이터를 불러오는 함수 (예시)
      //   const res = await fetch("api/something")
      //   if (!res.ok) {
      //     throw new Response("Failed to load data", { status: res.status })
      //   }
    },
    // element 내부적으로 Errorboundary가 잡지 않는,
    // 이벤트 핸들러의 의한 에러를 제외하고 라우터에서 잡히는 에러에 대한 UI
    errorElement: <ErrorPage />,
  },
  {
    path: "/applications",
    element: <Applications />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/semesters",
    element: <Semesters />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/reminders",
    element: <Reminders />,
    errorElement: <ErrorPage />,
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
