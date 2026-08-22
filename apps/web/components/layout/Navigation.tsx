"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSObject } from "@emotion/react";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { useRecruitCtaClick, useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

const NAV_LINKS = [
  { label: "모집 안내", href: "/recruit" },
  { label: "프로젝트", href: "/project" },
  { label: "블로그", href: "/blog" },
] as const;

/** 뒤 배경을 굴절시키는 유리 필터 */
const GLASS_FILTER = "blur(24px) saturate(180%)";
const GLASS_FILTER_STRONG = "blur(30px) saturate(185%)";

/** backdrop-filter 미지원 브라우저용 폴백 (투명도를 낮춰 가독성 확보) */
const NO_BACKDROP_SUPPORT =
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))";

/** 유리 가장자리에 맺히는 반사광(specular rim) */
const glassRim: CSSObject = {
  content: '""',
  position: "absolute",
  inset: 0,
  borderRadius: "inherit",
  padding: "1px",
  background:
    "linear-gradient(140deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.2) 28%, rgba(255, 255, 255, 0.05) 52%, rgba(255, 255, 255, 0.35) 76%, rgba(255, 255, 255, 0.9))",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
  pointerEvents: "none",
};

/** 표면 상단에 고이는 광택(gloss) */
const glassGloss: CSSObject = {
  content: '""',
  position: "absolute",
  top: "1px",
  left: "1px",
  right: "1px",
  height: "48%",
  borderRadius: "inherit",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0))",
  pointerEvents: "none",
};

/** 광택 레이어 위로 콘텐츠를 올리기 위한 레이어링 */
const glassContent: CSSObject = {
  position: "relative",
  zIndex: 1,
};

const Header = styled.header({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: "flex",
  padding: "32px 80px",
  pointerEvents: "none",

  "@media (max-width: 768px)": {
    padding: "16px 40px",
  },
  "@media (max-width: 767px)": {
    padding: "16px 16px",
  },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  pointerEvents: "auto",
  position: "relative",
});

const LogoLink = styled(Link)({
  display: "flex",
  flexShrink: 0,
});

const DesktopGroup = styled.div({
  display: "flex",
  alignItems: "center",

  "@media (max-width: 768px)": {
    display: "none",
  },
});

const NavPill = styled.nav({
  position: "relative",
  isolation: "isolate",
  display: "flex",
  alignItems: "center",
  gap: "2px",
  padding: "4px",
  borderRadius: "99px",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.48))",
  backdropFilter: GLASS_FILTER,
  WebkitBackdropFilter: GLASS_FILTER,
  boxShadow: [
    "0 18px 40px rgba(2, 17, 31, 0.28)",
    "0 2px 8px rgba(2, 17, 31, 0.12)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -8px 18px rgba(255, 255, 255, 0.25)",
  ].join(", "),

  "&::before": glassRim,
  "&::after": glassGloss,

  [NO_BACKDROP_SUPPORT]: {
    background: "rgba(255, 255, 255, 0.92)",
  },
});

const NavItem = styled(Link)({
  ...glassContent,
  display: "flex",
  alignItems: "center",
  padding: "12px 28px",
  borderRadius: "99px",
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  color: colors.textPrimary,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition:
    "background 0.25s ease, box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "16px",
  },
  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "14px",
  },

  "&:hover": {
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))",
    boxShadow: "0 6px 16px rgba(2, 17, 31, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "scale(0.97)",
  },

  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover, &:active": {
      transform: "none",
    },
  },
});

/** 히어로 CTA 와 동일한 솔리드 스타일 — 유리 재질 미적용 */
const CtaButton = styled(Link)({
  display: "flex",
  alignItems: "center",
  height: "55px",
  padding: "12px 28px",
  borderRadius: "99px",
  background: colors.primary,
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background 0.15s",
  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "16px",
    display: "none",
  },
  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "14px",
  },

  "&:hover": {
    background: "#1f5fe0",
  },

  '&[aria-disabled="true"]': {
    background: colors.disabled,
    cursor: "default",
  },
});

const MobileBar = styled.div({
  display: "none",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",

  "@media (max-width: 768px)": {
    display: "flex",
  },
});

const MobileMenuButton = styled.button({
  position: "relative",
  isolation: "isolate",
  borderRadius: "99px",
  border: "none",
  display: "flex",
  padding: "12px",
  justifyContent: "center",
  alignItems: "center",
  gap: "2px",
  cursor: "pointer",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.5))",
  backdropFilter: GLASS_FILTER,
  WebkitBackdropFilter: GLASS_FILTER,
  boxShadow: [
    "0 12px 28px rgba(2, 17, 31, 0.26)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -6px 14px rgba(255, 255, 255, 0.25)",
  ].join(", "),
  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",

  "&::before": glassRim,
  "&::after": glassGloss,

  "& svg": glassContent,

  "&:active": {
    transform: "scale(0.94)",
  },

  [NO_BACKDROP_SUPPORT]: {
    background: "rgba(255, 255, 255, 0.92)",
  },

  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:active": {
      transform: "none",
    },
  },
});

const MobileDrawer = styled.nav<{ open: boolean }>(({ open }) => ({
  display: open ? "flex" : "none",
  position: "absolute",
  isolation: "isolate",
  top: "84px",
  left: "16px",
  right: "16px",
  borderRadius: "22px",
  padding: "12px",
  flexDirection: "column",
  gap: "8px",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.5))",
  backdropFilter: GLASS_FILTER_STRONG,
  WebkitBackdropFilter: GLASS_FILTER_STRONG,
  boxShadow: [
    "0 24px 60px rgba(2, 17, 31, 0.35)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -10px 24px rgba(255, 255, 255, 0.22)",
  ].join(", "),
  pointerEvents: "auto",

  "&::before": glassRim,
  "&::after": { ...glassGloss, height: "38%" },

  [NO_BACKDROP_SUPPORT]: {
    background: "rgba(255, 255, 255, 0.94)",
  },

  "@media (max-width: 767px)": {
    top: "72px",
  },
}));

const MobileItem = styled(Link)({
  ...glassContent,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "14px",
  textDecoration: "none",
  color: colors.textPrimary,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  transition: "background 0.2s ease",

  "&:active": {
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  },
});

/** 데스크톱 CTA 와 동일한 솔리드 스타일 — 유리 재질 미적용 */
const MobileCta = styled(Link)({
  ...glassContent,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "14px",
  textDecoration: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  transition: "background 0.15s",

  "&:active": {
    background: "#1f5fe0",
  },

  '&[aria-disabled="true"]': {
    background: colors.disabled,
    cursor: "default",
  },
});

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const { isRecruitOpen, isRecruitClosed, recruitButtonLabels } = useRecruitStatus();
  const handleCtaClick = useRecruitCtaClick();
  const recruitActionHref = isRecruitOpen ? "/recruit/apply" : "/recruit";

  return (
    <Header>
      <Inner>
        <DesktopGroup>
          <LogoLink href="/" aria-label="DDD 홈으로">
            <img src={assets.logo} alt="DDD" width={55} height={55} />
          </LogoLink>
          <NavPill>
            {NAV_LINKS.map(({ label, href }) => (
              <NavItem key={href} href={href}>
                {label}
              </NavItem>
            ))}
          </NavPill>
        </DesktopGroup>
        <MobileBar>
          <LogoLink href="/" aria-label="DDD 홈으로">
            <img src={assets.logo} alt="DDD" width={48} height={48} />
          </LogoLink>
          <MobileMenuButton
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
            >
              <path d="M0 0H18V2H0V0ZM0 6H18V8H0V6ZM0 12H18V14H0V12Z" fill="#202325" />
            </svg>
          </MobileMenuButton>
        </MobileBar>
        <CtaButton
          href={recruitActionHref}
          aria-disabled={isRecruitClosed || undefined}
          onClick={handleCtaClick}
        >
          {recruitButtonLabels.navigation}
        </CtaButton>
        <MobileDrawer open={open}>
          {NAV_LINKS.map(({ label, href }) => (
            <MobileItem key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </MobileItem>
          ))}
          <MobileCta
            href={recruitActionHref}
            aria-disabled={isRecruitClosed || undefined}
            onClick={(event) => {
              setOpen(false);
              handleCtaClick(event);
            }}
          >
            {recruitButtonLabels.navigation}
          </MobileCta>
        </MobileDrawer>
      </Inner>
    </Header>
  );
};
