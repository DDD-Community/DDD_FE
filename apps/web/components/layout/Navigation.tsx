"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { recruitButtonLabels, recruitStatus } from "@/constants/recruit";
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
  background: "rgba(255, 255, 255, 0.55)",
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
  border: "1px solid rgba(255, 255, 255, 0.22)",
  boxShadow: "0 10px 26px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
  borderRadius: "99px",
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background 0.15s",

  "&:hover": {
    background: "rgba(31, 95, 224, 0.9)",
  },

  "@media (max-width: 768px)": {
    display: "none",
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
  border: "1px solid rgba(255, 255, 255, 0.35)",
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(14px) saturate(160%)",
  WebkitBackdropFilter: "blur(14px) saturate(160%)",
  boxShadow: "0 10px 26px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
  borderRadius: "99px",
  width: "48px",
  height: "48px",
  color: colors.textPrimary,
  fontSize: "20px",
  lineHeight: "20px",
  cursor: "pointer",
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
  const isRecruitOpen = recruitStatus === "open";

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
            ≡
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
