"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { colors } from "@/constants/tokens";

/*
  목록을 불러오는 동안 결과가 들어올 자리를 미리 잡아두는 회색 블록.

  탭이나 페이지 번호를 눌렀을 때 이전 목록이 그대로 남아 있으면 응답이 올 때까지
  "눌리긴 한 건가" 가 되고, 그 시간이 그대로 느림으로 읽힌다. 반대로 빈 화면을 두면
  결과가 들어올 때 레이아웃이 튄다. 같은 자리·같은 크기의 블록을 깔아 둘 다 피한다.

  실제 카드와 같은 그리드 안에 놓아야 크기가 맞으므로, 카드 모양 스켈레톤은 이걸
  조립해 각 목록 섹션에서 만든다.
*/

// 배경을 실제로 움직이려면 그라데이션이 박스보다 넓어야 한다. 200% 로 깔고 한 바퀴 민다.
const shimmer = keyframes({
  from: { backgroundPosition: "200% 0" },
  to: { backgroundPosition: "-200% 0" },
});

export const Skeleton = styled.div({
  background: `linear-gradient(90deg, ${colors.categoryBg} 25%, #f3f4f6 50%, ${colors.categoryBg} 75%)`,
  backgroundSize: "200% 100%",
  animation: `${shimmer} 1.4s ease-in-out infinite`,
  borderRadius: "8px",

  // 애니메이션을 줄여 달라고 설정한 사용자에게는 움직임 없이 자리만 잡아준다.
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    background: colors.categoryBg,
  },
});

/**
 * 화면에는 보이지 않고 스크린리더에만 읽히는 문구.
 *
 * 스켈레톤은 시각적 장치라 읽어줄 내용이 없다. 로딩 중이라는 사실을 말로 전하는
 * 자리가 따로 필요하다.
 */
export const VisuallyHidden = styled.span({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
