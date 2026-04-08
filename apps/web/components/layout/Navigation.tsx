'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const NAV_LINKS = [
  { label: '모집 안내', href: '/recruit' },
  { label: '프로젝트', href: '/project' },
  { label: '블로그', href: '/blog' },
] as const;

const Header = styled.header({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '32px',
  pointerEvents: 'none',
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1280px',
  padding: '0 40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  pointerEvents: 'auto',
});

const LogoLink = styled(Link)({
  display: 'flex',
  flexShrink: 0,
});

const NavPill = styled.nav({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  background: 'white',
  borderRadius: '99px',
  padding: '4px',
});

const NavItem = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 28px',
  borderRadius: '99px',
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  color: colors.textPrimary,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s',

  '&:hover': {
    background: 'rgba(0,0,0,0.06)',
  },
});

const CtaButton = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  height: '55px',
  padding: '12px 28px',
  background: colors.primary,
  borderRadius: '99px',
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s',

  '&:hover': {
    background: '#1f5fe0',
  },
});

export const Navigation = () => {
  return (
    <Header>
      <Inner>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
        </div>
        <CtaButton href="/recruit">사전 알림 신청</CtaButton>
      </Inner>
    </Header>
  );
};
