/** 백엔드 ApplicationGetAdminListStatus — generated 타입 미생성 시 로컬 정의 */
export type ApplicationStatus =
  | "서류심사대기"
  | "서류합격"
  | "서류불합격"
  | "최종합격"
  | "최종불합격"
  | "활동중"
  | "활동완료"
  | "활동중단"

/** 다음 단계 진행 맵 — null이면 종결 상태 */
export const NEXT_STATUS: Record<ApplicationStatus, ApplicationStatus | null> = {
  서류심사대기: "서류합격",
  서류합격: "최종합격",
  최종합격: "활동중",
  활동중: "활동완료",
  서류불합격: null,
  최종불합격: null,
  활동완료: null,
  활동중단: null,
}

/** 백엔드 파트 enum → 운영진 친숙 표시명 */
export const PART_LABEL: Record<string, string> = {
  PM: "PM",
  PD: "PD",
  BE: "Server",
  FE: "Web",
  IOS: "iOS",
  AND: "Android",
}
