export type ProjectCategory = '전체' | 'iOS' | 'AOS' | 'WEB';

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: Exclude<ProjectCategory, '전체'>;
  generation: string;
  banner: string;
  pdf: string;
  detailTitle: string;
  longDescription: string;
  participants: Array<{ name: string; role: string }>;
};

export const projects: ProjectItem[] = [
  {
    id: 'festibee',
    title: 'FESTIBEE (페스티비)',
    description: '언제 열리는지, 누가 나오는지, 무슨 곡을 부르는지, 티켓은 언제 오픈하는지...',
    thumbnail: 'https://www.figma.com/api/mcp/asset/ccd98c05-1f2c-467a-b7ac-ff128d95271e',
    category: 'iOS',
    generation: '13기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'FESTIBEE (페스티비)',
    longDescription:
      '페스티벌 좋아하세요?\n언제 열리는지, 누가 나오는지, 무슨 곡을 부르는지, 티켓은 언제 오픈하는지...\n궁금한 모든 걸 한 번에 확인할 수 있는 곳 👉 페스티비 🐝\n올 가을 페스티벌, 놓치지 말고 함께해요! 앱스토어에서 "페스티비"를 검색해보세요!',
    participants: [
      { name: '최현희', role: 'PM' },
      { name: '이윤경', role: 'DESIGN' },
      { name: '이무성', role: 'WEB' },
      { name: '정원석', role: 'WEB' },
      { name: '이준석', role: 'SERVER' },
    ],
  },
  {
    id: 'growit',
    title: 'GROWIT (그로잇)',
    description: '직장인을 위한 자기 발견 및 성장 시각화 웹/앱 회고 플랫폼',
    thumbnail: 'https://www.figma.com/api/mcp/asset/a47e2ca8-af7b-4857-b777-a1b5782dd355',
    category: 'iOS',
    generation: '13기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'GROWIT (그로잇)',
    longDescription: '직장인을 위한 자기 발견 및 성장 시각화 기반의 회고 플랫폼이에요.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'moyorak',
    title: 'MOYORAK (모여락)',
    description: '"오늘 뭐 먹지?" 고민 없이 즐기는 맛집 아카이브 앱',
    thumbnail: 'https://www.figma.com/api/mcp/asset/65143f56-76be-413d-8f82-3dbc8ca403c6',
    category: 'iOS',
    generation: '13기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'MOYORAK (모여락)',
    longDescription: '맛집 기록과 공유에 집중한 모바일 서비스예요.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'elkkung',
    title: '얼꿍',
    description: 'MBTI 기반의 AI 비서 소개 서비스',
    thumbnail: 'https://www.figma.com/api/mcp/asset/a2e249b2-008f-4c43-90b4-db329d22282f',
    category: 'iOS',
    generation: '11기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: '얼꿍',
    longDescription: 'AI 캐릭터와 상호작용하는 경험 중심 앱입니다.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'polabo',
    title: 'POLABO',
    description: '폴라로이드 필름 형식으로 추억과 일상을 기록하는 서비스',
    thumbnail: 'https://www.figma.com/api/mcp/asset/f794f275-9797-4c18-90ba-b4fb85c46282',
    category: 'iOS',
    generation: '11기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'POLABO',
    longDescription: '추억을 필름처럼 남기는 감성 기록 앱입니다.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'mozip',
    title: 'MOZIP',
    description: 'MZOF의 IT 직군에게 맞춤형 공고를 추천해주는 서비스',
    thumbnail: 'https://www.figma.com/api/mcp/asset/a4efb90f-649c-4e70-8178-534417a6e83e',
    category: 'iOS',
    generation: '11기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'MOZIP',
    longDescription: '직군 맞춤 공고 탐색을 돕는 리쿠르팅 앱이에요.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'pregen',
    title: 'Pregen',
    description: '내가 뭘 좋아하는지 쉽게 기록할 수 있도록 돕는 앱',
    thumbnail: 'https://www.figma.com/api/mcp/asset/955b5514-9230-425b-8c05-572a7108e635',
    category: 'iOS',
    generation: '12기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'Pregen',
    longDescription: '간편한 질문 기반으로 취향을 축적하는 앱입니다.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'myeongji',
    title: '명언제과점',
    description: '명언 아카이브',
    thumbnail: 'https://www.figma.com/api/mcp/asset/27f7342c-63ad-464b-967b-3d5f0bf70258',
    category: 'iOS',
    generation: '9기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: '명언제과점',
    longDescription: '좋은 문장을 저장하고 공유하는 서비스입니다.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
  {
    id: 'fridge-link',
    title: 'Fridge Link',
    description: '식자재를 관리하고 지인들과 나눔하는 냉장고 관리 서비스',
    thumbnail: 'https://www.figma.com/api/mcp/asset/923753dc-322c-41a6-80c2-6cc4789d7279',
    category: 'iOS',
    generation: '12기',
    banner: 'https://www.figma.com/api/mcp/asset/39713c2d-c910-464b-b5de-75b8be740a98',
    pdf: 'https://www.figma.com/api/mcp/asset/f0701c4d-0589-42e5-8582-3db3e23a0465',
    detailTitle: 'Fridge Link',
    longDescription: '냉장고 재고를 공유하고 낭비를 줄이는 생활형 서비스예요.',
    participants: [{ name: 'DDD Team', role: 'iOS' }],
  },
];
