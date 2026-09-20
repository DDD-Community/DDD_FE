"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** 드로어가 화면을 덮는 모바일에서는 로고 대신 '홈' 항목으로 홈 진입 경로를 노출한다 */
const MOBILE_NAV_LINKS = [{ label: "홈", href: "/" }, ...NAV_LINKS] as const;

/** `/project/{id}` 같은 하위 경로에서도 상위 메뉴가 active 로 유지되도록 prefix 까지 본다 */
const isActiveHref = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

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

/**
 * 표면 상단에 고이는 광택(gloss).
 *
 * 부모와 같은 실루엣(`inset: 1px` + `borderRadius: inherit`)으로 깔고, 높이는 그라디언트
 * 정지점으로만 준다. 예전처럼 `height: 48%` 박스를 쓰면 그 박스의 `border-radius: 99px`
 * 가 부모가 아니라 자기 높이 기준으로 다시 clamp 돼(≈11px) 부모 코너(≈24px)보다 훨씬
 * 각지고, 그 차이만큼 좌우 상단 모서리 밖으로 광택이 삐져나온다. 네비바 양 끝에 회색
 * 사각형이 붙어 보이던 원인이 이것이다.
 */
const createGlassGloss = (fadeStop: string): CSSObject => ({
  content: '""',
  position: "absolute",
  inset: "1px",
  borderRadius: "inherit",
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) ${fadeStop})`,
  pointerEvents: "none",
});

/** 광택 레이어 위로 콘텐츠를 올리기 위한 레이어링 */
const glassContent: CSSObject = {
  position: "relative",
  zIndex: 1,
};

/** 로고·네비바·메뉴버튼·드로어가 공유하는 유리 재질 */
const glassSurface: CSSObject = {
  position: "relative",
  isolation: "isolate",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.48))",
  backdropFilter: GLASS_FILTER,
  WebkitBackdropFilter: GLASS_FILTER,

  "&::before": glassRim,
  "&::after": createGlassGloss("48%"),

  [NO_BACKDROP_SUPPORT]: {
    background: "rgba(255, 255, 255, 0.92)",
  },
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
  ...glassSurface,
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  width: "55px",
  height: "55px",
  borderRadius: "99px",
  boxShadow: [
    "0 12px 28px rgba(2, 17, 31, 0.26)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -6px 14px rgba(255, 255, 255, 0.25)",
  ].join(", "),

  "@media (max-width: 768px)": {
    width: "48px",
    height: "48px",
  },
});

/**
 * 로고를 유리 위에 얹기 위한 마스크 레이어.
 *
 * 원본 PNG 는 흰색 마크라 밝은 유리 표면에서는 보이지 않는다. 알파를 마스크로만 쓰고
 * 색은 메뉴 아이콘과 같은 `textPrimary` 로 채워, 유리 위 요소들의 명도를 맞춘다.
 */
const LogoMark = styled.span({
  ...glassContent,
  width: "100%",
  height: "100%",
  background: colors.textPrimary,
  WebkitMaskImage: `url("${assets.logo}")`,
  maskImage: `url("${assets.logo}")`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

const DesktopGroup = styled.div({
  display: "flex",
  alignItems: "center",
  gap: "12px",

  "@media (max-width: 768px)": {
    display: "none",
  },
});

const NavPill = styled.nav({
  ...glassSurface,
  display: "flex",
  alignItems: "center",
  gap: "2px",
  padding: "4px",
  borderRadius: "99px",
  boxShadow: [
    "0 18px 40px rgba(2, 17, 31, 0.28)",
    "0 2px 8px rgba(2, 17, 31, 0.12)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -8px 18px rgba(255, 255, 255, 0.25)",
  ].join(", "),
});

/**
 * 현재 경로 메뉴를 표시하는 파란 틴트 칩.
 *
 * '지금 이 페이지' 는 안내일 뿐 액션이 아니므로, 솔리드 CTA 보다 한 단계 조용하게 둔다.
 * 연한 배경 + primary 글자 + 얇은 링 조합이면 CTA 와 헷갈리지 않으면서도 선택 상태는 분명하다.
 *
 * 상태 전달은 별도 prop 대신 `aria-current` 속성을 그대로 쓴다. `&:hover` 와 특이도가 같아서
 * (클래스+가상클래스 vs 클래스+속성) 소스 순서로 승패가 갈리므로, 각 컴포넌트에서 반드시
 * hover/active 블록 **뒤에** 선언한다. 객체 키 병합이 아니라 캐스케이드로 겹치므로
 * hover 의 transform 같은 나머지 선언은 그대로 살아 있다.
 */
const activeItemSurface: CSSObject = {
  background: colors.mainLight,
  color: colors.primary,
  fontWeight: fontWeights.semiBold,
  boxShadow: "inset 0 0 0 1px rgba(46, 113, 255, 0.28)",
};

/** 파란 CTA 를 한 톤 어둡게 누르는 hover 색 */
const CTA_HOVER_BACKGROUND = "#1f5fe0";

const NavItem = styled(Link)({
  ...glassContent,
  display: "flex",
  alignItems: "center",
  padding: "12px 28px",
  borderRadius: "99px",
  fontFamily: "var(--font-pretendard), sans-serif",
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

  '&[aria-current="page"]': activeItemSurface,

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
  fontFamily: "var(--font-pretendard), sans-serif",
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
    background: CTA_HOVER_BACKGROUND,
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
  ...glassSurface,
  borderRadius: "99px",
  border: "none",
  display: "flex",
  padding: "12px",
  justifyContent: "center",
  alignItems: "center",
  gap: "2px",
  cursor: "pointer",
  boxShadow: [
    "0 12px 28px rgba(2, 17, 31, 0.26)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -6px 14px rgba(255, 255, 255, 0.25)",
  ].join(", "),
  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",

  "& svg": glassContent,

  "&:active": {
    transform: "scale(0.94)",
  },

  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:active": {
      transform: "none",
    },
  },
});

const MobileDrawer = styled.nav<{ open: boolean }>(({ open }) => ({
  ...glassSurface,
  display: open ? "flex" : "none",
  position: "absolute",
  top: "84px",
  left: "16px",
  right: "16px",
  borderRadius: "22px",
  padding: "12px",
  flexDirection: "column",
  gap: "8px",
  backdropFilter: GLASS_FILTER_STRONG,
  WebkitBackdropFilter: GLASS_FILTER_STRONG,
  boxShadow: [
    "0 24px 60px rgba(2, 17, 31, 0.35)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.75)",
    "inset 0 -10px 24px rgba(255, 255, 255, 0.22)",
  ].join(", "),
  pointerEvents: "auto",

  "&::after": createGlassGloss("38%"),

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

  '&[aria-current="page"]': activeItemSurface,
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
    background: CTA_HOVER_BACKGROUND,
  },

  '&[aria-disabled="true"]': {
    background: colors.disabled,
    cursor: "default",
  },
});

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isRecruitOpen, isRecruitClosed, recruitButtonLabels } = useRecruitStatus();
  const handleCtaClick = useRecruitCtaClick();
  const recruitActionHref = isRecruitOpen ? "/recruit/apply" : "/recruit";

  return (
    <Header>
      <Inner>
        <DesktopGroup>
          <LogoLink href="/" aria-label="DDD 홈으로">
            <LogoMark />
          </LogoLink>
          <NavPill>
            {NAV_LINKS.map(({ label, href }) => (
              <NavItem
                key={href}
                href={href}
                aria-current={isActiveHref(pathname, href) ? "page" : undefined}
              >
                {label}
              </NavItem>
            ))}
          </NavPill>
        </DesktopGroup>
        <MobileBar>
          <LogoLink href="/" aria-label="DDD 홈으로">
            <LogoMark />
          </LogoLink>
          <MobileMenuButton
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
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
        <MobileDrawer id="mobile-nav-drawer" open={open}>
          {MOBILE_NAV_LINKS.map(({ label, href }) => (
            <MobileItem
              key={href}
              href={href}
              aria-current={isActiveHref(pathname, href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
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
