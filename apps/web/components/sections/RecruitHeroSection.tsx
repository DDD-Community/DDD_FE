"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
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
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "0 320px",
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
    padding: "0 48px",
  },
  "@media (max-width: 375px)": {
    padding: "0 16px",
    gap: "20px",
  },
});

const Label = styled.p({
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 1024px)": { fontSize: "18px" },
  "@media (max-width: 768px)": { fontSize: "16px" },
  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
});

const Title = styled.h1({
  margin: 0,
  fontSize: "120px",
  lineHeight: "140px",
  fontWeight: fontWeights.bold,
  backgroundImage: `url('${assets.recruitHeroTextBg}')`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "cover",
  backgroundPosition: "center",
  whiteSpace: "pre-line",

  "@media (max-width: 1024px)": { fontSize: "84px", lineHeight: "102px" },
  "@media (max-width: 768px)": { fontSize: "64px", lineHeight: "78px" },
  "@media (max-width: 375px)": { fontSize: "44px", lineHeight: "52px" },
});

const Description = styled.p({
  margin: 0,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,
  whiteSpace: "pre-line",

  "@media (max-width: 768px)": { fontSize: "18px", lineHeight: "24px" },
  "@media (max-width: 375px)": { fontSize: "12px", lineHeight: "16px" },
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
  return (
    <Section>
      <Bg>{/* background image */}</Bg>
      <Overlay />
      <Inner>
        <Label>Recruitment</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
          <Title>{"Currently Under\nRenewal"}</Title>
          <Description>
            {
              "다음 크루원 모집을 위해 DDD 운영진들이 열심히 준비 중이에요.\n크루원 모집 준비가 끝나면 그 누구보다 빠르게 연락 드릴게요!"
            }
          </Description>
        </div>
        <CtaButton href="/recruit">
          사전 알림 신청하기
          <Arrow aria-hidden>→</Arrow>
        </CtaButton>
      </Inner>
    </Section>
  );
};
