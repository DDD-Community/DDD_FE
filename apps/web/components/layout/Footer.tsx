"use client";

import styled from "@emotion/styled";
import { Fragment } from "react";
import { assets } from "@/constants/assets";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

type SocialLinkItem = {
  label: string;
  href: string;
  icon?: string;
};

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    label: "Instagram",
    icon: assets.social.instagram,
    href: "https://www.instagram.com/dynamic_ddd?igsh=MTF1Mm42eW8xZTZ4YQ==",
  },
  { label: "Tistory", icon: assets.social.tistory, href: "https://dynamic-ddd.tistory.com/" },
  { label: "Medium", icon: assets.social.medium, href: "https://dddstudy.medium.com/" },
  { label: "Brunch", icon: assets.social.brunch, href: "https://brunch.co.kr/@6d3076805b994b9" },
];

const FooterWrapper = styled.footer({
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "80px",
  minHeight: "317px",

  "@media (max-width: 1024px)": {
    padding: "100px 80px",
  },
  "@media (max-width: 768px)": {
    padding: "100px 80px",
  },
  "@media (max-width: 375px)": {
    background: "#000000",
    padding: "48px 16px 40px",
    minHeight: "unset",
  },
});

const FooterInner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
});

const FooterTop = styled.div({
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  gap: "80px",
  justifyContent: "center",
  padding: "0 20px",
  marginBottom: "80px",

  "@media (max-width: 375px)": {
    flexDirection: "column",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: "32px",
    padding: 0,
    marginBottom: "40px",
    textAlign: "center",
  },
});

const FooterSection = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",

  "@media (max-width: 375px)": {
    alignItems: "center",
    width: "100%",
  },
});

const FooterLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.small,
  color: colors.textInverse,
  "@media (max-width: 1024px)": {
    fontSize: "12px",
    lineHeight: "16px",
  },
  "@media (max-width: 768px)": {
    fontSize: "11px",
    lineHeight: "15px",
  },
  "@media (max-width: 375px)": {
    fontSize: "10px",
    lineHeight: "13px",
    color: colors.slate500,
  },
});

const FooterEmail = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,
  "@media (max-width: 1024px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: fontWeights.bold,
  },
});

const SocialLinks = styled.div({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "16px",

  "@media (max-width: 375px)": {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "auto 1px auto",
    gridTemplateRows: "auto auto",
    justifyContent: "center",
    justifyItems: "center",
    alignItems: "center",
    columnGap: "12px",
    rowGap: "20px",

    "& > a:nth-of-type(1)": {
      gridColumn: 1,
      gridRow: 1,
    },
    "& > span:nth-of-type(1)": {
      gridColumn: 2,
      gridRow: 1,
    },
    "& > a:nth-of-type(2)": {
      gridColumn: 3,
      gridRow: 1,
    },
    "& > span:nth-of-type(2)": {
      display: "none",
    },
    "& > a:nth-of-type(3)": {
      gridColumn: 1,
      gridRow: 2,
    },
    "& > span:nth-of-type(3)": {
      gridColumn: 2,
      gridRow: 2,
    },
    "& > a:nth-of-type(4)": {
      gridColumn: 3,
      gridRow: 2,
    },
  },
});

const SocialLink = styled.a({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,
  textDecoration: "none",
  "@media (max-width: 1024px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },

  "&:hover": {
    opacity: 0.8,
  },

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: fontWeights.bold,
  },
});

const Divider = styled.span({
  width: "1px",
  height: "14px",
  background: colors.slate300,

  "@media (max-width: 375px)": {
    height: "16px",
    background: colors.textInverse,
    alignSelf: "center",
  },
});

const Copyright = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
  color: colors.textInverse,
  textAlign: "center",

  "@media (max-width: 375px)": {
    fontSize: "11px",
    lineHeight: "15px",
    fontWeight: fontWeights.regular,
  },
});

export const Footer = () => {
  return (
    <FooterWrapper>
      <FooterInner>
        <FooterTop>
          <FooterSection>
            <FooterLabel>Email</FooterLabel>
            <FooterEmail>dddstudy1@gmail.com</FooterEmail>
          </FooterSection>
          <FooterSection>
            <FooterLabel>Follow us</FooterLabel>
            <SocialLinks>
              {SOCIAL_LINKS.map(({ label, icon, href }, index) => (
                <Fragment key={label}>
                  {index > 0 && <Divider />}
                  <SocialLink href={href} target="_blank" rel="noopener noreferrer">
                    {icon ? <img src={icon} alt="" width={24} height={24} /> : null}
                    {label}
                  </SocialLink>
                </Fragment>
              ))}
            </SocialLinks>
          </FooterSection>
        </FooterTop>
        <Copyright>©2026 DDD. All Rights Reserved.</Copyright>
      </FooterInner>
    </FooterWrapper>
  );
};
