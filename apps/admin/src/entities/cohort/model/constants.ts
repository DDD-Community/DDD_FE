import { CohortPartConfigDtoName } from "@ddd/api"

import type { CohortPartName } from "@ddd/api"

/**
 * 서버 파트 enum → 사용자 표시 라벨.
 * 서버 enum 을 단일 진실 출처로 두고, UI 에 노출되는 한글 라벨만 여기에 유지한다.
 */
export const PART_LABEL: Record<CohortPartName, string> = {
  [CohortPartConfigDtoName.PM]: "PM",
  [CohortPartConfigDtoName.PD]: "PD",
  [CohortPartConfigDtoName.BE]: "백엔드",
  [CohortPartConfigDtoName.FE]: "프론트엔드",
  [CohortPartConfigDtoName.IOS]: "iOS",
  [CohortPartConfigDtoName.AND]: "Android",
}

/** Drawer 의 파트 탭 순서 (서버 enum 그대로) */
export const SEMESTER_PARTS: CohortPartName[] = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
]
