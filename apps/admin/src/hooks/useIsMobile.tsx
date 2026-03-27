import { useEffect, useState } from "react"

/** 현재 접속 환경이 모바일인지 여부를 반환하는 훅 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    // 초기값은 클라이언트에서만 접근 가능한 window 객체를 사용하여 설정
    () => typeof window !== "undefined" && window.innerWidth <= 768
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mq.addEventListener("change", handleResize)
    return () => mq.removeEventListener("change", handleResize)
  }, [])

  return isMobile
}
