import { CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortStatus } from "@ddd/api"

/** status enum → 사용자 표시 라벨 */
export const STATUS_LABEL: Record<CohortStatus, string> = {
  [CreateCohortRequestDtoStatus.UPCOMING]: "모집 예정",
  [CreateCohortRequestDtoStatus.RECRUITING]: "모집중",
  [CreateCohortRequestDtoStatus.ACTIVE]: "활동중",
  [CreateCohortRequestDtoStatus.CLOSED]: "활동 종료",
}

/**
 * 다음 단계 status. CLOSED 는 종착이라 null 을 반환.
 * UI 는 null 일 때 전환 버튼 자체를 렌더링하지 않는다.
 */
export const nextStatus = (s: CohortStatus): CohortStatus | null => {
  switch (s) {
    case CreateCohortRequestDtoStatus.UPCOMING:
      return CreateCohortRequestDtoStatus.RECRUITING
    case CreateCohortRequestDtoStatus.RECRUITING:
      return CreateCohortRequestDtoStatus.ACTIVE
    case CreateCohortRequestDtoStatus.ACTIVE:
      return CreateCohortRequestDtoStatus.CLOSED
    case CreateCohortRequestDtoStatus.CLOSED:
      return null
    default: {
      // exhaustive check — 새 status 추가 시 컴파일 에러로 알림
      const _exhaustive: never = s
      void _exhaustive
      return null
    }
  }
}

/** 전환 버튼에 표시될 라벨 ("모집중 전환", "활동중 전환", "활동 종료") */
export const NEXT_STATUS_BUTTON_LABEL: Record<CohortStatus, string | null> = {
  [CreateCohortRequestDtoStatus.UPCOMING]: "모집중 전환",
  [CreateCohortRequestDtoStatus.RECRUITING]: "활동중 전환",
  [CreateCohortRequestDtoStatus.ACTIVE]: "활동 종료",
  [CreateCohortRequestDtoStatus.CLOSED]: null,
}
