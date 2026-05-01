export type ArticleItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
};

export const articles: ArticleItem[] = [
  {
    id: "xr-ai",
    title: "픽셀을 넘어 공간으로: AI 시대, 디자이너가 XR에 주목해야 하는 이유",
    description:
      "오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다.",
    thumbnail: "https://www.figma.com/api/mcp/asset/0e31934c-fbed-4345-b503-8cca5045ac7e",
  },
  {
    id: "pm-books",
    title: "주니어 PM 성장 속도를 바꿔준 책 4권",
    description: "PM으로 성장하고 싶다면, 기능이 아니라 사고방식부터 바꿔야 합니다.",
    thumbnail: "https://www.figma.com/api/mcp/asset/1229b7f4-2c7f-4324-8c36-3e3c6cb83b3c",
  },
  {
    id: "claude-cowork",
    title: "클로드 코워크로 나만의 AI 비서를 개발하는 방법",
    description: "코딩을 1도 모르는 사람도 자동화할 수 있는 방법? 여기에 있습니다.",
    thumbnail: "https://www.figma.com/api/mcp/asset/d5b54725-15f1-42b6-bbda-b9f36ffa4598",
  },
  {
    id: "mcp-productivity",
    title: "요즘 일잘러들은 MCP써서 시간을 아낍니다!",
    description:
      "슬랙 알림 999+, 노션 회의록 밀림, 문서 탭 10개... AI에 외부 도구를 꽂아주는 MCP로 업무를 자동화해요.",
    thumbnail: "https://www.figma.com/api/mcp/asset/d7334eff-f307-440c-8264-5615739bf811",
  },
] as const;
