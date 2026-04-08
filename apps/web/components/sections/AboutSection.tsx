'use client';

import styled from '@emotion/styled';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const STATS = [
  { label: 'DDD가 탄생한지', value: '10년' },
  { label: '누적 멤버 수', value: '470명+' },
  { label: '런칭 성공률', value: 'nn%' },
] as const;

const Section = styled.section({
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '120px 40px',
  gap: '80px',
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1280px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '80px',
});

const TitleArea = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  textAlign: 'center',
  width: '100%',
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.textInverse,
});

const Title = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.paragraphXxxl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.paragraphXxxl,
  color: colors.slate200,
  whiteSpace: 'pre-wrap',
});

const TitleHighlight = styled.span({
  color: colors.textInverse,
});

const TitleMuted = styled.span({
  color: colors.slate500,
});

const StatsGrid = styled.div({
  display: 'flex',
  gap: '24px',
  width: '100%',

  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

const StatCard = styled.div({
  flex: '1 0 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: '50px 20px',
  background: colors.backgroundDark,
  borderRadius: '20px',
  boxShadow: 'inset 3px 3px 25px 0px rgba(146, 146, 146, 0.25)',
});

const StatLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.slate300,
  textAlign: 'center',
});

const StatValue = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: '80px',
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.paragraphXxxl,
  color: colors.textInverse,
  textAlign: 'center',
});

export const AboutSection = () => {
  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>About Us</SectionLabel>
          <Title>
            <TitleMuted>함께 성장하고 싶은 {'\n'}</TitleMuted>
            <TitleHighlight>PM, 디자이너, 개발자</TitleHighlight>
            <TitleMuted>
              {`가 모여 \nDDD에서 프로젝트를 만들어요.`}
            </TitleMuted>
          </Title>
        </TitleArea>
        <StatsGrid>
          {STATS.map(({ label, value }) => (
            <StatCard key={label}>
              <StatLabel>{label}</StatLabel>
              <StatValue>{value}</StatValue>
            </StatCard>
          ))}
        </StatsGrid>
      </Inner>
    </Section>
  );
};
