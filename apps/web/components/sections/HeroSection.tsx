"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { useRecruitCtaClick, useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

const Section = styled.section({
  position: "relative",
  width: "100%",
  height: "100vh",
  minHeight: "1080px",
  overflow: "hidden",
  background: colors.background,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "@media (max-width: 768px)": {
    minHeight: "820px",
  },
  "@media (max-width: 767px)": {
    minHeight: "812px",
  },
});

const BgImage = styled.div({
  position: "absolute",
  inset: 0,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

/*
 * 암전 오버레이는 두지 않는다.
 *
 * 피그마 bg(2085:2389)는 `futuree_2 1` 원본 위에 Rectangle 8
 * (blur 5px + rgba(12,14,15,0.7))을 덮지만, 레포의 hero-bg.jpg 는 그 합성 결과를
 * 이미 구워둔 파일이다. 원본과 픽셀을 대조하면 `0.7×(12,14,15) + 0.3×원본` 가설의
 * 평균 오차가 0.98/255(JPEG 노이즈 수준)로, 오버레이가 적용된 상태임이 확인된다.
 * 여기서 한 겹 더 덮으면 두 번 어두워져 모집안내 히어로(RecruitHeroSection)와
 * 배경이 달라진다.
 */
const Hero3D = styled.picture({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -55%)",
  opacity: 0.6,
  pointerEvents: "none",
});

const Hero3DImage = styled.img({
  width: "341.804px",
  height: "350.535px",
  flexShrink: 0,
  aspectRatio: "39/40",
  opacity: 0.6,
  background: `url(${assets.hero3d}) no-repeat center center`,
  backgroundSize: "cover",

  "@media (max-width: 1024px)": {
    width: "331px",
    height: "331px",
  },
  "@media (max-width: 768px)": {
    width: "309px",
    height: "309px",
  },
  "@media (max-width: 767px)": {
    width: "185px",
    height: "185px",
  },
});

const Content = styled.div({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px",
  textAlign: "center",
  width: "100%",
  maxWidth: "1280px",
  padding: "0 40px",

  "@media (max-width: 768px)": {
    gap: "28px",
    padding: "0 24px",
  },
  "@media (max-width: 767px)": {
    gap: "20px",
    padding: "0 16px",
  },
});

const HeadlineWrapper = styled.div({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: "40px",
  alignItems: "center",
});

const GradientHeadline = styled.h1({
  fontFamily: "'Pretendard', sans-serif",
  // 피그마는 줄바꿈을 텍스트에 고정해 두었다(1920: 2줄 / 375: 3줄).
  // \n 을 살리되, 지정 폭을 넘치면 자연 줄바꿈으로 흘려보낸다.
  whiteSpace: "pre-line",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
  maxWidth: "100%",
  width: "100%",
  fontWeight: fontWeights.bold,
  // 피그마 원안은 텍스트에 클리핑된 세로 알파 그라데이션이다(가로 방향 변화 없음).
  // 상단이 거의 투명해 첫 줄 뒤의 3D 오브젝트가 비쳐 보이는 것이 의도된 연출이므로,
  // RecruitHeroSection 의 타이틀과 동일한 스톱을 쓴다.
  backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.00) -3.04%, #FFF 95.35%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  // 글자가 컨텐츠 박스를 벗어날 때 기본값(repeat)이 다음 타일 상단을 찍어 밝은 띠를 만든다.
  backgroundRepeat: "no-repeat",
  fontSize: "clamp(45px, 6.92vw + 1px, 130px)",
  lineHeight: "clamp(50px, 6.41vw + 7px, 130px)",
  "@media (max-width: 1024px)": {
    fontSize: "clamp(45px, 8.59vw + 12px, 100px)",
    lineHeight: "clamp(50px, 9.38vw + 14px, 110px)",
  },
  "@media (max-width: 768px)": {
    fontSize: "clamp(45px, 14.29vw - 20px, 90px)",
    lineHeight: "clamp(50px, 15.87vw - 20px, 100px)",
  },
  "@media (max-width: 767px)": {
    fontSize: "45px",
    lineHeight: "50px",
  },
});

/**
 * 375 프레임에서만 살아나는 줄바꿈.
 *
 * 헤드라인·서브타이틀 모두 피그마가 1920 에선 2줄, 375 에선 3줄로 끊어 두었고
 * 늘어나는 한 줄의 위치가 서로 다르다. 공통 줄바꿈은 텍스트에 그대로 두고,
 * 375 에서만 추가되는 줄바꿈을 이 컴포넌트로 표시한다.
 */
const MobileBreak = styled.br({
  display: "none",

  "@media (max-width: 767px)": {
    display: "block",
  },
});

const Subtitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  // clamp 하한은 375 브레이크포인트의 xl/Heading/Large (16/20) 다.
  fontSize: "clamp(16px, calc(1.541vw + 8.22px), 20px)",
  fontWeight: fontWeights.semiBold,
  lineHeight: "clamp(20px, calc(1.849vw + 11.07px), 32px)",
  color: colors.textInverse,
});

const CtaButton = styled(Link)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  height: "80px",
  padding: "20px 50px",
  background: colors.primary,
  borderRadius: "100px",
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  textDecoration: "none",
  flexShrink: 0,
  transition: "background 0.15s",

  "&:hover": {
    background: "#1f5fe0",
  },

  '&[aria-disabled="true"]': {
    background: colors.disabled,
    cursor: "default",
  },

  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "24px",
  },

  "@media (max-width: 768px)": {
    height: "68px",
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    height: "48px",
    justifyContent: "center",
    padding: "0 40px",
    fontSize: "14px",
    lineHeight: "18px",
    "& svg": { width: "20px", height: "20px" },
  },
});

export const HeroSection = () => {
  const { isRecruitClosed, recruitButtonLabels } = useRecruitStatus();
  const handleCtaClick = useRecruitCtaClick();

  return (
    <Section>
      <BgImage>
        <img src={assets.heroBg} alt="" />
      </BgImage>
      <Hero3D>
        <Hero3DImage src={assets.hero3d} alt="" />
      </Hero3D>
      <Content>
        <HeadlineWrapper>
          <GradientHeadline>
            {"일 잘하는 사람들은\n어디서 "}
            <MobileBreak />
            {"성장하는 걸까요?"}
          </GradientHeadline>
          <Subtitle>
            {"10년간 470명이 선택한 "}
            <MobileBreak />
            IT 사이드프로젝트 동아리 DDD.
            <br />
            퇴근 후에도 성장하고 싶은 사람들이 여기 모입니다.
          </Subtitle>
        </HeadlineWrapper>
        <CtaButton
          href="/recruit"
          aria-disabled={isRecruitClosed || undefined}
          onClick={handleCtaClick}
        >
          {recruitButtonLabels.hero}
          {isRecruitClosed ? null : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"
                fill="white"
              />
            </svg>
          )}
        </CtaButton>
      </Content>
    </Section>
  );
};
