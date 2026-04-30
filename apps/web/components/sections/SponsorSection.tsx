"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

const SPONSORS = [
  { name: "Elice", logo: assets.sponsors.elice },
  { name: "ICTCOC", logo: assets.sponsors.ictcoc },
  { name: "아산나눔재단", logo: assets.sponsors.asanNanum },
  { name: "한빛미디어", logo: assets.sponsors.hanbit },
] as const;

const Section = styled.section({
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "120px 80px",
  gap: "24px",

  "@media (max-width: 1024px)": { padding: "120px 80px" },
  "@media (max-width: 768px)": { padding: "100px 40px" },
  "@media (max-width: 375px)": { padding: "80px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
});

const TitleArea = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  width: "100%",
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: "clamp(16px, calc(0.925vw + 12.53px), 24px)",
  fontWeight: fontWeights.medium,
  lineHeight: "clamp(22px, calc(1.233vw + 17.38px), 34px)",
  color: colors.textInverse,
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "28px",
  },
  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "22px",
  },
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: "clamp(24px, calc(0.925vw + 20.53px), 32px)",
  fontWeight: fontWeights.semiBold,
  lineHeight: "clamp(30px, calc(1.233vw + 25.38px), 40px)",
  color: colors.textInverse,
  "@media (max-width: 768px)": {
    fontSize: "28px",
    lineHeight: "34px",
  },
  "@media (max-width: 375px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
});

const LogoGrid = styled.div({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px",
  paddingTop: "20px",
  width: "100%",
});

const SponsorLogo = styled.div({
  width: "160px",
  height: "160px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",

  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
});

const ContactButton = styled(Link)({
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
  whiteSpace: "nowrap",
  flexShrink: 0,
  transition: "background 0.15s",

  "&:hover": {
    background: "#1f5fe0",
  },

  "@media (max-width: 375px)": {
    height: "56px",
    padding: "30px 40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

export const SponsorSection = () => {
  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>Sponsor</SectionLabel>
          <SectionTitle>
            DDD는 다양한 파트너사와 함께 성장하고 있어요.
            <br />
            후원과 협력으로 더 나은 IT 커뮤니티를 만들어가고 있습니다.
          </SectionTitle>
        </TitleArea>
        <LogoGrid>
          {SPONSORS.map(({ name, logo }) => (
            <SponsorLogo key={name}>
              <img src={logo} alt={name} />
            </SponsorLogo>
          ))}
        </LogoGrid>
        <ContactButton href="mailto:dddstudy1@gmail.com">
          후원 문의하기
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
        </ContactButton>
      </Inner>
    </Section>
  );
};
