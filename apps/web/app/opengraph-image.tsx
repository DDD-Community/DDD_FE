import { ImageResponse } from "next/og";
import { loadOgFonts, ogColors } from "@/lib/og";

/*
  모집 CTA 는 일부러 그리지 않는다. 스크린샷으로 뜨던 이전 OG 이미지는 네비게이션의
  [모집 종료] 배지까지 박제되는 바람에, 모집이 열려도 공유 링크만 "모집 종료" 로
  보이는 문제가 있었다. 상태에 따라 변하는 것은 아예 프레임에 넣지 않는다.
*/

export const alt = "DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 88px",
        backgroundColor: ogColors.background,
        backgroundImage: `radial-gradient(120% 90% at 78% 18%, #1d242b 0%, ${ogColors.background} 62%)`,
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 10,
          color: ogColors.accent,
        }}
      >
        DDD
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
        <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: ogColors.textMuted }}>
          일 잘하는 사람들은
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: ogColors.textPrimary,
            marginTop: 6,
          }}
        >
          어디서 성장하는 걸까요?
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: ogColors.textSecondary,
          marginTop: 44,
        }}
      >
        10년간 470명이 선택한 IT 사이드프로젝트 동아리
      </div>
    </div>,
    { ...size, fonts },
  );
}
