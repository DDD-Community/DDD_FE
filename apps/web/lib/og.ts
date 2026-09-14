/**
 * OG 이미지(`next/og`) 렌더링에 쓰는 폰트와 색.
 *
 * Satori 는 시스템 폰트를 쓰지 않는다. 폰트를 명시적으로 넘기지 않으면 한글이 전부
 * 두부(□)로 그려지므로 본문과 같은 Pretendard 를 받아서 넘긴다. woff2 는 Satori 가
 * 읽지 못하니 woff 를 받는다 — 같은 CDN 을 `globals.css` 도 이미 쓰고 있다.
 */
const PRETENDARD_WOFF =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff";

export const ogColors = {
  background: "#0c0e0f",
  textPrimary: "#ffffff",
  textMuted: "#5b6470",
  textSecondary: "#cad5e2",
  accent: "#90a1b9",
} as const;

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

export async function loadOgFonts(): Promise<OgFont[]> {
  const [regular, bold] = await Promise.all([
    fetchFont("Pretendard-Regular.woff"),
    fetchFont("Pretendard-Bold.woff"),
  ]);

  return [
    { name: "Pretendard", data: regular, weight: 400, style: "normal" },
    { name: "Pretendard", data: bold, weight: 700, style: "normal" },
  ];
}

async function fetchFont(fileName: string): Promise<ArrayBuffer> {
  // 매 생성마다 1MB 씩 다시 받을 이유가 없다 — 폰트는 버전이 URL 에 박혀 있어 불변이다.
  const response = await fetch(`${PRETENDARD_WOFF}/${fileName}`, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error(`OG 폰트를 받지 못했다: ${fileName} (${response.status})`);
  }

  return response.arrayBuffer();
}
