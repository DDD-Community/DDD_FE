'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const Section = styled.section({
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '120px 320px',
  gap: '24px',
  textAlign: 'center',

  '@media (max-width: 1024px)': { padding: '120px 80px' },
  '@media (max-width: 768px)': { padding: '100px 40px' },
  '@media (max-width: 375px)': { padding: '80px 16px' },
});

const Inner = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',

  '@media (max-width: 375px)': {
    gap: '16px',
  },
});

const Headline = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingXl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingXl,
  color: colors.textInverse,

  '@media (max-width: 768px)': {
    fontSize: '30px',
    lineHeight: '36px',
  },
  '@media (max-width: 375px)': {
    fontSize: '28px',
    lineHeight: '32px',
  },
});

const HeadlineHighlight = styled.span({
  color: colors.primary,
});

const CtaButton = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  height: '80px',
  padding: '20px 50px',
  background: colors.primary,
  borderRadius: '100px',
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'background 0.15s',

  '&:hover': {
    background: '#1f5fe0',
  },

  '@media (max-width: 768px)': {
    height: '68px',
    padding: '16px 36px',
    fontSize: '18px',
    lineHeight: '24px',
  },
  '@media (max-width: 375px)': {
    height: '56px',
    padding: '14px 24px',
    fontSize: '14px',
    lineHeight: '18px',
  },
});

export const CtaSection = () => {
  return (
    <Section>
      <Inner>
        <Headline>
          성장은 혼자 하는 게 아니에요.
          <br />
          함께 만들고, 함께 성장할 동료를{' '}
          <HeadlineHighlight>DDD</HeadlineHighlight>
          에서 만나보세요.
        </Headline>
        <CtaButton href="/recruit">
          사전 알림 신청하기
          <img src={assets.arrowRight} alt="" width={24} height={24} />
        </CtaButton>
      </Inner>
    </Section>
  );
};
