import { useEffect, useState } from "react"

/** 현재 접속 환경이 모바일인지 여부를 반환하는 훅 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    // 초기값은 클라이언트에서만 접근 가능한 window 객체를 사용하여 설정
    () => typeof window !== "undefined" && window.innerWidth <= 768
  )

  useEffect(() => {
    /** innerWidth대신 matchMedia를 사용하여 반응형 처리하는 이유는
     * 사용자가 창 크기를 조절할 때마다 innerWidth는 계속 업데이트되어야 하지만,
     * matchMedia는 특정 조건(예: max-width: 768px)에 따라 true/false로 상태를 관리할 수 있어,
     * 불필요한 리렌더링을 줄일 수 있습니다.
     */
    const mq = window.matchMedia("(max-width: 768px)")

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mq.addEventListener("change", handleResize)
    return () => mq.removeEventListener("change", handleResize)
  }, [])

  return isMobile
}
