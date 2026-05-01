"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { openPreAlertModal } from "@/components/modals/PreAlertModal";
import { useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
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
  "@media (max-width: 375px)": {
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

const BgOverlay = styled.div({
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(5px)",
  background: "rgba(12, 14, 15, 0.7)",
});

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
  "@media (max-width: 375px)": {
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
  "@media (max-width: 375px)": {
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
  whiteSpace: "nowrap",
  wordBreak: "keep-all",
  fontWeight: fontWeights.bold,
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.00) -3.04%, #FFF 95.35%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontSize: fontSizes.headingXxl,
  lineHeight: lineHeights.headingXxl,
  "@media (max-width: 1024px)": {
    fontSize: "100px",
    lineHeight: "110px",
  },
  "@media (max-width: 768px)": {
    fontSize: "90px",
    lineHeight: "100px",
    whiteSpace: "normal",
    width: "100%",
    textWrap: "balance",
  },
  "@media (max-width: 375px)": {
    fontSize: "45px",
    lineHeight: "50px",
  },
});

const Subtitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: "clamp(14px, calc(1.541vw + 8.22px), 28px)",
  fontWeight: fontWeights.semiBold,
  lineHeight: "clamp(18px, calc(1.849vw + 11.07px), 32px)",
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

  "@media (max-width: 768px)": {
    height: "68px",
    padding: "16px 36px",
    fontSize: "18px",
    lineHeight: "24px",
  },
  "@media (max-width: 375px)": {
    height: "56px",
    width: "100%",
    maxWidth: "280px",
    justifyContent: "center",
    padding: "30px 40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

export const HeroSection = () => {
  const { isRecruitOpen, recruitButtonLabels } = useRecruitStatus();

  return (
    <Section>
      <BgImage>
        <img src={assets.heroBg} alt="" />
      </BgImage>
      <BgOverlay />
      <Hero3D>
        <Hero3DImage src={assets.hero3d} alt="" />
      </Hero3D>
      <Content>
        <HeadlineWrapper>
          <GradientHeadline>
            일 잘하는 사람들은
            <br />
            어디서 성장하는 걸까요?
          </GradientHeadline>
          <Subtitle>
            10년간 470명이 선택한 IT 사이드프로젝트 동아리 DDD.
            <br />
            퇴근 후에도 성장하고 싶은 사람들이 여기 모입니다.
          </Subtitle>
        </HeadlineWrapper>
        <CtaButton
          href="/recruit"
          onClick={(event) => {
            if (isRecruitOpen) return;
            event.preventDefault();
            openPreAlertModal();
          }}
        >
          {recruitButtonLabels.hero}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"
              fill="white"
            />
          </svg>{" "}
        </CtaButton>
      </Content>
    </Section>
  );
};
