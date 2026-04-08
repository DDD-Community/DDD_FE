'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const Section = styled.section({
  position: 'relative',
  width: '100%',
  height: '100vh',
  minHeight: '700px',
  overflow: 'hidden',
  background: colors.background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const BgImage = styled.div({
  position: 'absolute',
  inset: 0,

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const BgOverlay = styled.div({
  position: 'absolute',
  inset: 0,
  backdropFilter: 'blur(5px)',
  background: 'rgba(12, 14, 15, 0.7)',
});

const Content = styled.div({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '1280px',
  padding: '0 40px',
});

const HeadlineWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
  alignItems: 'center',
});

const GradientHeadline = styled.h1({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingXxl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingXxl,
  backgroundImage: `url('${assets.heroTextBg}')`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  whiteSpace: 'nowrap',

  '@media (max-width: 1200px)': {
    fontSize: '80px',
    lineHeight: '100px',
  },
});

const Subtitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,

  '@media (max-width: 768px)': {
    fontSize: fontSizes.large,
  },
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
});

export const HeroSection = () => {
  return (
    <Section>
      <BgImage>
        <img src={assets.heroBg} alt="" />
      </BgImage>
      <BgOverlay />
      <Content>
        <HeadlineWrapper>
          <GradientHeadline>
            일 잘하는 사람들은
            <br />
            어디서 성장하는 걸까요?
          </GradientHeadline>
          <Subtitle>
            10년간 470명이 선택한 IT 사이드프로젝트 동아리 DDD.
            <br />
            퇴근 후에도 성장하고 싶은 사람들이 여기 모입니다.
          </Subtitle>
        </HeadlineWrapper>
        <CtaButton href="/recruit">
          사전 알림 신청하기
          <img src={assets.arrowRight} alt="" width={24} height={24} />
        </CtaButton>
      </Content>
    </Section>
  );
};
