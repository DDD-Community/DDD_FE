export type RecruitStatus = "open" | "closed";

export const recruitStatus: RecruitStatus = "closed";

export const recruitPageMetaDescriptionByStatus: Record<RecruitStatus, string> = {
  open: "지금 DDD 크루원을 모집하고 있어요! 함께 성장할 준비가 되셨다면 지금 바로 지원해보세요.",
  closed: "DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다.",
};

export const recruitHeroDescriptionByStatus: Record<RecruitStatus, string> = {
  open: "지금 DDD 크루원을 모집하고 있어요!\n함께 성장할 준비가 되셨다면 지금 바로 지원해보세요.",
  closed:
    "다음 크루원 모집을 위해 DDD 운영진들이 열심히 준비 중이에요.\n크루원 모집 준비가 끝나면 그 누구보다 빠르게 연락 드릴게요!",
};

export const recruitButtonLabelsByStatus: Record<
  RecruitStatus,
  { navigation: string; hero: string; role: string }
> = {
  open: {
    navigation: "지원 신청",
    hero: "지원하기",
    role: "지원하기",
  },
  closed: {
    navigation: "사전 알림 신청",
    hero: "사전 알림 신청하기",
    role: "지원마감",
  },
};

export const recruitButtonLabels = recruitButtonLabelsByStatus[recruitStatus];

export const recruitParts = [
  { name: "Product Manager" },
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

export const recruitSchedules = [
  { step: "01", label: "서류 접수", date: "2026.02.12 (목) - 02.18 (수)" },
  { step: "02", label: "서류 발표", date: "2026.02.12" },
  { step: "03", label: "온라인 인터뷰", date: "2026.02.12 (목) - 02.18 (수)" },
  { step: "04", label: "최종 발표", date: "2026.02.12 (목)" },
] as const;

export const recruitCurriculum = [
  {
    week: "1주차",
    date: "03.07",
    title: "Orientation",
    description: "크루원들과 처음 만나서 이야기를 나누는 날",
  },
  {
    week: "2주차",
    date: "03.21",
    title: "부스팅 데이",
    description: "팀에서 정한 아이디어를 바탕으로 기획을 구체화하는 날이에요",
  },
  {
    week: "3주차",
    date: "04.04",
    title: "직군 세션",
    description:
      "같은 직군 멤버들과 모여 각자의 경험과 고민을 나누고, 시야를 넓히는 네트워킹 데이에요",
  },
  {
    week: "4주차",
    date: "04.18",
    title: "UT 1차",
    description:
      "같은 직군 멤버들과 모여 각자의 경험과 고민을 나누고, 시야를 넓히는 네트워킹 데이에요",
  },
  {
    week: "5주차",
    date: "05.02",
    title: "중간 발표",
    description: "현재까지의 진행 상황과 서비스 방향을 공유하고, 피드백을 통해 방향성을 점검해요",
  },
  {
    week: "6주차",
    date: "05.16",
    title: "티키타카",
    description: "프로젝트를 잠시 벗어나, 전체 멤버들과 자유롭게 소통하며 관계를 다지는 날이에요",
  },
  {
    week: "7주차",
    date: "05.30",
    title: "UT 2차",
    description: "구현된 서비스를 중심으로 다시 한 번 사용성 테스트를 진행하고 완성도를 높여요",
  },
  {
    week: "8주차",
    date: "06.13",
    title: "직군 세션",
    description:
      "프로젝트를 진행하며 쌓인 인사이트를 바탕으로, 직군별 경험을 공유하는 네트워킹 시간이에요",
  },
  {
    week: "9주차",
    date: "06.27",
    title: "최종발표",
    description: "4개월간의 결과물을 정리해 발표하고, 프로젝트를 하나의 서비스로 마무리해요",
  },
] as const;
