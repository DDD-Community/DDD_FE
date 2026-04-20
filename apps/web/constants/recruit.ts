export type RecruitStatus = "open" | "closed";

export const recruitStatus: RecruitStatus = "open";

const recruitButtonLabelsByStatus: Record<
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
    featured: true,
  },
  { name: "Back-end" },
  { name: "Front-end" },
  { name: "iOS" },
  { name: "Android" },
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
