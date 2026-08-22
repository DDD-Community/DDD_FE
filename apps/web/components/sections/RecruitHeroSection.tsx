"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { recruitHeroDescriptionByStatus } from "@/constants/recruit";
import { useRecruitCtaClick, useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
import { colors, fontWeights } from "@/constants/tokens";

const Section = styled.section({
  position: "relative",
  overflow: "hidden",
  background: colors.background,
  minHeight: "1080px",
  paddingTop: "120px",

  "@media (max-width: 1024px)": {
    minHeight: "1080px",
  },
  "@media (max-width: 768px)": {
    minHeight: "1000px",
    paddingTop: "100px",
  },
  "@media (max-width: 767px)": {
    minHeight: "812px",
    paddingTop: "54px",
  },
});

/**
 * 히어로 배경. 모집 상태에 따라 **서로 다른 이미지**를 쓴다.
 *
 * - 모집중        → `img_faqbg`(2140:2631) 청록 계열
 * - 사전알림·지원마감 → `bg`(573:4077) 어두운 녹/검정 계열
 *
 * 두 노드의 위치가 달라서 주의가 필요하다. 지원마감 쪽 `bg` 는 히어로 프레임
 * (573:4076) 의 자식이지만, 모집중 쪽 `img_faqbg` 는 히어로 프레임(183:1459) 밖에
 * 페이지 프레임(2136:5076)의 형제로 깔려 있다. 그래서 히어로 프레임만 단독으로 보면
 * 배경이 없는 것처럼 보인다 — 실제로 그렇게 오판해서 모집중 배경을 빠뜨린 적이 있다.
 *
 * 암전 오버레이는 두지 않는다. 시안 완성본과 배경 원본의 픽셀이 일치해서
 * (#080a0a / #0a0c0b / #161e18 …) 그 위에 덮인 레이어가 없음이 확인됐다.
 */
const Bg = styled.div<{ src: string }>(({ src }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor: colors.background,
  backgroundImage: `url('${src}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const Inner = styled.div({
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "44px",
  textAlign: "center",

  "@media (max-width: 1024px)": {
    padding: "0 80px",
  },
  "@media (max-width: 768px)": {
    padding: "0 20px",
  },
});

const Label = styled.p({
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  marginTop: "120px",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

// 디센더(g, y, p …)가 컨텐츠 박스 밖으로 빠져나가는 만큼 확보하는 여백.
// Pretendard 기준 디센더는 대략 0.21em 이므로 약간의 여유를 둔다.
const TITLE_DESCENDER_ROOM = "0.24em";

const Title = styled.h1({
  margin: 0,
  maxWidth: "100%",
  whiteSpace: "pre-line",
  fontSize: "130px",
  lineHeight: "130px",
  fontWeight: fontWeights.bold,
  // Figma 헤드 타이틀 느낌을 이미지가 아닌 타이포/그라데이션으로 구현
  backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.00) -3.04%, #FFF 95.35%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  // background-clip: text 는 padding 박스 안쪽에만 그라데이션을 칠한다.
  // line-height 가 font-size 와 같으면 "Recruiting" 의 g 디센더가 박스를 벗어나고,
  // 기본값인 background-repeat: repeat 탓에 그 자리에 다음 타일 상단이 찍혀 잘린 흰 덩어리로 보인다.
  // padding 으로 칠할 공간을 확보하고, 같은 크기의 음수 margin 으로 기존 레이아웃 간격은 유지한다.
  backgroundRepeat: "no-repeat",
  paddingBottom: TITLE_DESCENDER_ROOM,
  marginBottom: `-${TITLE_DESCENDER_ROOM}`,
  letterSpacing: "-0.02em",

  "@media (max-width: 1024px)": {
    fontSize: "100px",
    lineHeight: "110px",
  },
  "@media (max-width: 768px)": {
    fontSize: "clamp(45px, calc(45px + (100vw - 375px) * 45 / 393), 90px)",
    lineHeight: "clamp(50px, calc(50px + (100vw - 375px) * 50 / 393), 100px)",
  },
});

const Description = styled.p({
  margin: 0,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  whiteSpace: "pre-line",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const CtaButton = styled(Link)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  height: "80px",
  padding: "20px 50px",
  background: colors.primary,
  borderRadius: "100px",
  color: colors.textInverse,
  textDecoration: "none",
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,
  transition: "background 0.15s ease",

  "&:hover": { background: "#1f5fe0" },

  '&[aria-disabled="true"]': {
    background: colors.disabled,
    cursor: "default",
  },

  "@media (max-width: 768px)": {
    height: "68px",
    padding: "16px 36px",
    fontSize: "18px",
  },
  "@media (max-width: 767px)": {
    height: "40px",
    width: "157px",
    maxWidth: "157px",
    padding: "0 16px",
    fontSize: "12px",
    lineHeight: "16px",
  },
});

const Arrow = styled.span({
  display: "inline-flex",
  width: "24px",
  height: "24px",
  alignItems: "center",
  justifyContent: "center",
  transform: "translateY(-1px)",
});

export const RecruitHeroSection = () => {
  const { recruitStatus, isRecruitOpen, isRecruitClosed, recruitButtonLabels } = useRecruitStatus();
  const handleCtaClick = useRecruitCtaClick();
  const heroTitle = recruitStatus === "open" ? "Now\nRecruiting" : "Currently Under\nRenewal";
  const recruitActionHref = isRecruitOpen ? "/recruit/apply" : "/recruit";

  return (
    <Section>
      <Bg src={isRecruitOpen ? assets.recruitHeroOpenBg : assets.heroBg} />
      <Inner>
        <Label>Recruitment</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
          <Title>{heroTitle}</Title>
          <Description>{recruitHeroDescriptionByStatus[recruitStatus]}</Description>
        </div>
        <CtaButton
          href={recruitActionHref}
          aria-disabled={isRecruitClosed || undefined}
          onClick={handleCtaClick}
        >
          {recruitButtonLabels.hero}
          {isRecruitClosed ? null : (
            <Arrow aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M16.0032 9.41421L7.39663 18.0208L5.98242 16.6066L14.589 8H7.00324V6H18.0032V17H16.0032V9.41421Z"
                  fill="white"
                />
              </svg>
            </Arrow>
          )}
        </CtaButton>
      </Inner>
    </Section>
  );
};
