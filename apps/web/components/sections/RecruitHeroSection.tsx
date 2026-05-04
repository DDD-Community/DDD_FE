"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { recruitHeroDescriptionByStatus } from "@/constants/recruit";
import { useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
import { openPreAlertModal } from "@/components/modals/PreAlertModal";
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
  "@media (max-width: 375px)": {
    minHeight: "812px",
    paddingTop: "54px",
  },
});

const Bg = styled.div({
  position: "absolute",
  inset: 0,
  backgroundImage: `url('${assets.recruitHeroBg}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const Overlay = styled.div({
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(5px)",
  background: "rgba(12, 14, 15, 0.7)",
});

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
  "@media (max-width: 375px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const Title = styled.h1({
  margin: 0,
  maxWidth: "100%",
  whiteSpace: "pre-line",
  fontSize: "130px",
  lineHeight: "130px",
  fontWeight: fontWeights.bold,
  // Figma 헤드 타이틀 느낌을 이미지가 아닌 타이포/그라데이션으로 구현
  backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.00) -3.04%, #FFF 95.35%);",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
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
  "@media (max-width: 375px)": {
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

  "@media (max-width: 768px)": {
    height: "68px",
    padding: "16px 36px",
    fontSize: "18px",
  },
  "@media (max-width: 375px)": {
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
  const { recruitStatus, isRecruitOpen, recruitButtonLabels } = useRecruitStatus();
  const heroTitle = recruitStatus === "open" ? "Now\nRecruiting" : "Currently Under\nRenewal";

  return (
    <Section>
      <Bg>{/* background image */}</Bg>
      <Overlay />
      <Inner>
        <Label>Recruitment</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
          <Title>{heroTitle}</Title>
          <Description>{recruitHeroDescriptionByStatus[recruitStatus]}</Description>
        </div>
        <CtaButton
          href="/recruit"
          onClick={(event) => {
            if (isRecruitOpen) return;
            event.preventDefault();
            openPreAlertModal();
          }}
        >
          {recruitButtonLabels.hero}
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
        </CtaButton>
      </Inner>
    </Section>
  );
};
