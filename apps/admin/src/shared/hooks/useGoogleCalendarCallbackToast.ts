import { useEffect, useRef } from "react"
import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router"

import { googleCalendarKeys } from "@ddd/api"

const ERROR_MESSAGE: Record<string, string> = {
  denied: "Google 권한 요청이 취소됐어요",
  account_mismatch: "처음 연결한 Google 계정으로 다시 진행해 주세요",
  no_refresh_token:
    "캘린더 권한이 부족해요. 다시 연결하면서 모든 권한을 허용해 주세요",
  scope_missing:
    "캘린더 권한이 부족해요. 다시 연결하면서 모든 권한을 허용해 주세요",
}

export function useGoogleCalendarCallbackToast() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const calendar = params.get("calendar")
    if (calendar !== "connected" && calendar !== "error") return
    const key = `${location.pathname}${location.search}`
    if (handled.current === key) return
    handled.current = key

    if (calendar === "connected") {
      toast.success("Google 캘린더를 연결했어요")
      void queryClient.invalidateQueries({
        queryKey: googleCalendarKeys.status(),
      })
    } else {
      const reason = params.get("reason") ?? "unknown"
      toast.danger(
        ERROR_MESSAGE[reason] ?? `Google 캘린더 연결에 실패했어요 (${reason})`
      )
    }

    params.delete("calendar")
    params.delete("reason")
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params}` : "",
        hash: location.hash,
      },
      { replace: true }
    )
  }, [location.pathname, location.search, location.hash, navigate, queryClient])
}
