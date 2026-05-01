"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { useRecruitStatus } from "@/components/providers/RecruitStatusProvider";
import { openPreAlertModal } from "@/components/modals/PreAlertModal";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

const NAV_LINKS = [
  { label: "모집 안내", href: "/recruit" },
  { label: "프로젝트", href: "/project" },
  { label: "블로그", href: "/blog" },
] as const;

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
  "@media (max-width: 375px)": {
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
  display: "flex",
  alignItems: "center",
  gap: "2px",
  background: "#FFF",
  backdropFilter: "blur(14px) saturate(160%)",
  WebkitBackdropFilter: "blur(14px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
  borderRadius: "99px",
  padding: "4px",
});

const NavItem = styled(Link)({
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
  transition: "background 0.15s",
  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "16px",
  },
  "@media (max-width: 375px)": {
    fontSize: "12px",
    lineHeight: "14px",
  },

  "&:hover": {
    background: "rgba(255, 255, 255, 0.4)",
  },
});

const CtaButton = styled(Link)({
  display: "flex",
  alignItems: "center",
  height: "55px",
  padding: "12px 28px",
  background: "rgba(46, 113, 255, 0.85)",
  backdropFilter: "blur(14px) saturate(160%)",
  WebkitBackdropFilter: "blur(14px) saturate(160%)",
  borderRadius: "99px",
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
  "@media (max-width: 375px)": {
    fontSize: "12px",
    lineHeight: "14px",
  },
  "&:hover": {
    background: "rgba(31, 95, 224, 0.9)",
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
  borderRadius: "99px",
  border: "1px solid #CAD5E2",
  background: "#F1F5F9",
  display: "flex",
  padding: "12px",
  justifyContent: "center",
  alignItems: "center",
  gap: "2px",
});

const MobileDrawer = styled.nav<{ open: boolean }>(({ open }) => ({
  display: open ? "flex" : "none",
  position: "absolute",
  top: "84px",
  left: "16px",
  right: "16px",
  background: "rgba(255, 255, 255, 0.65)",
  backdropFilter: "blur(18px) saturate(160%)",
  WebkitBackdropFilter: "blur(18px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  borderRadius: "20px",
  padding: "12px",
  flexDirection: "column",
  gap: "8px",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
  pointerEvents: "auto",

  "@media (max-width: 375px)": {
    top: "72px",
  },
}));

const MobileItem = styled(Link)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  color: colors.textPrimary,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,

  "&:active": {
    background: "rgba(255, 255, 255, 0.35)",
  },
});

const MobileCta = styled(Link)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,

  boxShadow: "0 10px 26px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
});

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const { isRecruitOpen, recruitButtonLabels } = useRecruitStatus();

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
          href="/recruit"
          onClick={(event) => {
            if (isRecruitOpen) return;
            event.preventDefault();
            openPreAlertModal();
          }}
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
            href="/recruit"
            onClick={(event) => {
              setOpen(false);
              if (isRecruitOpen) return;
              event.preventDefault();
              openPreAlertModal();
            }}
          >
            {recruitButtonLabels.navigation}
          </MobileCta>
        </MobileDrawer>
      </Inner>
    </Header>
  );
};
