'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  padding: '120px 320px',
  gap: '80px',

  '@media (max-width: 1024px)': { padding: '120px 80px' },
  '@media (max-width: 768px)': { padding: '100px 40px' },
  '@media (max-width: 375px)': { padding: '80px 16px' },
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1920px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '80px',

  '@media (max-width: 768px)': {
    gap: '56px',
  },
  '@media (max-width: 375px)': {
    gap: '40px',
  },
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

  '@media (max-width: 375px)': {
    fontSize: '20px',
    lineHeight: '28px',
  },
});

const Title = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.paragraphXxxl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.paragraphXxxl,
  color: colors.slate200,
  whiteSpace: 'pre-wrap',

  '@media (max-width: 768px)': {
    fontSize: '48px',
    lineHeight: '60px',
  },
  '@media (max-width: 375px)': {
    fontSize: '64px',
    lineHeight: '75px',
  },
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

  '@media (max-width: 768px)': {
    padding: '40px 16px',
  },
  '@media (max-width: 375px)': {
    padding: '28px 16px',
    borderRadius: '16px',
  },
});

const StatLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.slate300,
  textAlign: 'center',

  '@media (max-width: 375px)': {
    fontSize: '20px',
    lineHeight: '28px',
  },
});

const StatValue = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: '80px',
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.paragraphXxxl,
  color: colors.textInverse,
  textAlign: 'center',

  '@media (max-width: 768px)': {
    fontSize: '64px',
    lineHeight: '72px',
  },
  '@media (max-width: 375px)': {
    fontSize: '48px',
    lineHeight: '55px',
  },
});

const useCountUpOnView = (target: number, enabled: boolean) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (reduceMotion) {
      let raf = 0;
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }

    let raf = 0;
    const durationMs = 1200;
    const start = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(progress);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, target]);

  return value;
};

const useInViewOnce = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};

const formatWithCommas = (n: number) => n.toLocaleString('ko-KR');

const parseNumericStat = (raw: string) => {
  const match = raw.match(/(\d[\d,]*)/);
  if (!match) return null;
  const numeric = Number(match[1].replaceAll(',', ''));
  if (!Number.isFinite(numeric)) return null;
  const suffix = raw.replace(match[0], '');
  return { numeric, suffix };
};

const StatValueCountUp = ({
  rawValue,
  enabled,
}: {
  rawValue: string;
  enabled: boolean;
}) => {
  const parsed = useMemo(() => parseNumericStat(rawValue), [rawValue]);
  const animated = useCountUpOnView(parsed?.numeric ?? 0, enabled && Boolean(parsed));

  if (!parsed) return <>{rawValue}</>;
  return <>{`${formatWithCommas(animated)}${parsed.suffix}`}</>;
};

export const AboutSection = () => {
  const { ref, inView } = useInViewOnce();

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
        <StatsGrid ref={ref}>
          {STATS.map(({ label, value }) => (
            <StatCard key={label}>
              <StatLabel>{label}</StatLabel>
              <StatValue>
                <StatValueCountUp rawValue={value} enabled={inView} />
              </StatValue>
            </StatCard>
          ))}
        </StatsGrid>
      </Inner>
    </Section>
  );
};
