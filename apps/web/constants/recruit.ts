/**
 * 모집 CTA 상태 — BE 의 ctaStatus 3값과 1:1 대응한다.
 *
 * status 가 RECRUITING 이어도 모집 기간(recruitStartAt ~ recruitEndAt) 밖이면
 * 지원이 열리지 않는다. (DDD_BE#68 모집 기간 게이트) 따라서 모집 개폐의 단일
 * 기준은 status 가 아니라 ctaStatus 다.
 * - preNotification: 모집 시작 전 — 사전 알림만 받는다
 * - open: 모집 기간 중 — 지원서 진입 허용
 * - closed: 모집 기간 종료(기수 상태 활동중/활동종료) — CTA 는 [모집 종료] 비활성
 */
export type RecruitStatus = "preNotification" | "open" | "closed";

export const recruitPageMetaDescriptionByStatus: Record<RecruitStatus, string> = {
  preNotification: "DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다.",
  open: "지금 DDD 크루원을 모집하고 있어요! 함께 성장할 준비가 되셨다면 지금 바로 지원해보세요.",
  closed: "DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다.",
};

export const recruitHeroDescriptionByStatus: Record<RecruitStatus, string> = {
  preNotification:
    "다음 크루원 모집을 위해 DDD 운영진들이 열심히 준비 중이에요.\n크루원 모집 준비가 끝나면 그 누구보다 빠르게 연락 드릴게요!",
  open: "지금 DDD 크루원을 모집하고 있어요!\n함께 성장할 준비가 되셨다면 지금 바로 지원해보세요.",
  closed:
    "다음 크루원 모집을 위해 DDD 운영진들이 열심히 준비 중이에요.\n크루원 모집 준비가 끝나면 그 누구보다 빠르게 연락 드릴게요!",
};

export const recruitButtonLabelsByStatus: Record<
  RecruitStatus,
  { navigation: string; hero: string; role: string }
> = {
  // 모집 시작 전에는 상단 CTA(네비/히어로) 로만 사전 알림을 안내한다.
  // 직군 카드 버튼은 지원서로 이어지지 않는 비활성 버튼이므로 [지원 마감] 으로 둔다.
  preNotification: {
    navigation: "사전 알림 신청",
    hero: "사전 알림 신청하기",
    role: "지원 마감",
  },
  open: {
    navigation: "지원 신청",
    hero: "지원하기",
    role: "지원하기",
  },
  // 모집 기간이 끝난 기수(활동중/활동종료)는 다음 모집 일정이 없으므로 사전 알림도
  // 받지 않는다. 기획 3.1.1 기수 상태 정의대로 [모집 종료] 비활성으로만 노출한다.
  closed: {
    navigation: "모집 종료",
    hero: "모집 종료",
    role: "지원 마감",
  },
};

export const recruitParts = [
  {
    name: "Product Manager",
    description:
      "사용자의 문제를 발견하고 서비스의 방향과 우선순위를 정해요. 다양한 직군과 협업하며 아이디어를 실제 사용자에게 닿는 서비스로 만들어요.",
  },
  {
    name: "Product Designer",
    description:
      "사용자의 니즈를 반영한 최상의 UI/UX를 만들어요. 여러 툴을 활용해 협업하며, 더 나은 사용자 경험을 고민해요.",
  },
  {
    name: "Back-end",
    description:
      "서버와 데이터의 흐름을 설계해 서비스가 안정적으로 동작하도록 만들어요. 성능과 확장성을 고려해 빠르고 유연한 시스템을 구축해요.",
  },
  {
    name: "Front-end",
    description:
      "사용자 중심의 직관적이고 빠른 웹 환경을 구축합니다. 최적화된 코드로 끊김 없는 사용자 경험을 제공합니다.",
  },
  {
    name: "iOS",
    description:
      "Apple 생태계에 맞춰 안정적인 앱을 만들어요. 섬세한 디테일로 완성도 높은 경험을 설계해요.",
  },
  {
    name: "Android",
    description:
      "다양한 환경에서 안정적으로 동작하는 앱을 만들어요. 지속 성장 가능한 서비스를 함께 개발해요.",
  },
] as const;

/**
 * 커리큘럼 활동별 안내 문구.
 *
 * 어드민 기수 등록 폼은 주차별로 `{ date, description }` 만 입력받고, 그 description
 * 은 화면에서 카드 제목("오리엔테이션", "부스팅 데이" …) 으로 쓰인다. 활동 설명은
 * BE 에 필드가 없으므로 활동명으로 매칭해 프론트에서 붙인다.
 *
 * 키는 공백 제거 + 소문자로 정규화한 활동명이다. 매칭되는 문구가 없으면 설명 줄은
 * 노출하지 않는다 — 운영진이 새 활동명을 넣었을 때 엉뚱한 설명이 붙는 것보다 낫다.
 */
const CURRICULUM_DESCRIPTIONS: Record<string, string> = {
  오리엔테이션: "크루원들과 처음 만나서 이야기를 나누는 날이에요",
  orientation: "크루원들과 처음 만나서 이야기를 나누는 날이에요",
  ot: "크루원들과 처음 만나서 이야기를 나누는 날이에요",
  부스팅데이: "팀에서 정한 아이디어를 바탕으로 기획을 구체화하는 날이에요",
  직군세션: "같은 직군 멤버들과 모여 각자의 경험과 고민을 나누고, 시야를 넓히는 네트워킹 데이에요",
  ut: "구현된 서비스를 중심으로 사용성 테스트를 진행하고 완성도를 높여요",
  ut세션: "구현된 서비스를 중심으로 사용성 테스트를 진행하고 완성도를 높여요",
  ut1차: "구현된 서비스를 중심으로 사용성 테스트를 진행하고 완성도를 높여요",
  ut2차: "구현된 서비스를 중심으로 다시 한 번 사용성 테스트를 진행하고 완성도를 높여요",
  중간발표: "현재까지의 진행 상황과 서비스 방향을 공유하고, 피드백을 통해 방향성을 점검해요",
  티키타카: "프로젝트를 잠시 벗어나, 전체 멤버들과 자유롭게 소통하며 관계를 다지는 날이에요",
  티키타카데이: "프로젝트를 잠시 벗어나, 전체 멤버들과 자유롭게 소통하며 관계를 다지는 날이에요",
  최종발표: "4개월간의 결과물을 정리해 발표하고, 프로젝트를 하나의 서비스로 마무리해요",
  데모데이: "4개월간의 결과물을 정리해 발표하고, 프로젝트를 하나의 서비스로 마무리해요",
};

/** 활동명(어드민 입력값) → 안내 문구. 매칭 실패 시 빈 문자열. */
export function findCurriculumDescription(activityName: string): string {
  return CURRICULUM_DESCRIPTIONS[activityName.replace(/\s+/g, "").toLowerCase()] ?? "";
}
