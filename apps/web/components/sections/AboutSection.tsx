"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";

const STATS = [
  { label: "DDD가 탄생한지", value: "10년" },
  { label: "누적 멤버 수", value: "470명+" },
  { label: "런칭 성공률", value: "nn%" },
] as const;

const Section = styled.section({
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "120px 80px",
  gap: "80px",

  "@media (max-width: 1024px)": { padding: "120px 80px" },
  "@media (max-width: 768px)": { padding: "100px 40px" },
  "@media (max-width: 767px)": { padding: "80px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "80px",

  "@media (max-width: 768px)": {
    gap: "56px",
  },
  "@media (max-width: 767px)": {
    gap: "40px",
  },
});

const TitleArea = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  textAlign: "center",
  width: "100%",

  // 375 의 Gutter 토큰은 12 다.
  "@media (max-width: 767px)": { gap: "12px" },
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.medium,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const Title = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.bold,
  color: colors.slate200,
  whiteSpace: "pre-wrap",
  fontSize: "64px",
  lineHeight: "75px",
  "@media (max-width: 1024px)": {
    fontSize: "54px",
    lineHeight: "65px",
  },
  "@media (max-width: 768px)": {
    fontSize: "42px",
    lineHeight: "52px",
  },
  "@media (max-width: 767px)": {
    fontSize: "38px",
    lineHeight: "48px",
  },
});

const TitleHighlight = styled.span({
  color: colors.textInverse,
});

const TitleMuted = styled.span({
  color: colors.slate500,
});

const StatsGrid = styled.div({
  display: "flex",
  gap: "24px",
  width: "100%",

  "@media (max-width: 768px)": {
    flexDirection: "column",
  },
  // 375 에서는 카드가 좌우 마진(16)보다 좁은 280 폭으로 가운데 정렬된다.
  "@media (max-width: 767px)": {
    maxWidth: "280px",
    gap: "12px",
  },
});

const StatCard = styled.div({
  flex: "1 0 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  padding: "50px 20px",
  background: colors.backgroundDark,
  borderRadius: "20px",
  boxShadow: "inset 3px 3px 25px 0px rgba(146, 146, 146, 0.25)",

  "@media (max-width: 768px)": {
    padding: "40px 16px",
  },
  "@media (max-width: 767px)": {
    padding: "30px 20px",
    borderRadius: "20px",
  },
});

const StatLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.medium,
  color: colors.slate300,
  textAlign: "center",
  fontSize: "20px",
  lineHeight: "28px",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const StatValue = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.bold,
  color: colors.textInverse,
  textAlign: "center",
  fontSize: "80px",
  lineHeight: "75px",
  "@media (max-width: 1024px)": {
    fontSize: "70px",
    lineHeight: "65px",
  },
  "@media (max-width: 768px)": {
    fontSize: "60px",
    lineHeight: "52px",
  },
  "@media (max-width: 767px)": {
    fontSize: "28px",
    lineHeight: "35px",
  },
});

const useCountUpOnView = (target: number, enabled: boolean) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      // 섹션이 화면에서 벗어났다가 다시 들어올 때
      // 동일한 “지금처럼” 애니메이션을 매번 재생하기 위해 리셋합니다.
      //
      // effect 안에서 곧바로 setState 하면 렌더가 연쇄되므로(react-hooks/set-state-in-effect)
      // 리셋도 프레임에 맡긴다. 다시 enabled 가 되는 시점엔 이미 0 이라
      // 카운트업 시작 전 별도 리셋이 필요 없다.
      const resetRaf = requestAnimationFrame(() => setValue(0));
      return () => cancelAnimationFrame(resetRaf);
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
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

const useInViewToggle = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 화면에 들어오면 true, 벗어나면 false로 토글합니다.
        // enabled가 토글될 때마다 count-up이 재생됩니다.
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};

const formatWithCommas = (n: number) => n.toLocaleString("ko-KR");

const parseNumericStat = (raw: string) => {
  const match = raw.match(/(\d[\d,]*)/);
  if (!match) return null;
  const numeric = Number(match[1].replaceAll(",", ""));
  if (!Number.isFinite(numeric)) return null;
  const suffix = raw.replace(match[0], "");
  return { numeric, suffix };
};

const StatValueCountUp = ({ rawValue, enabled }: { rawValue: string; enabled: boolean }) => {
  const parsed = useMemo(() => parseNumericStat(rawValue), [rawValue]);
  const animated = useCountUpOnView(parsed?.numeric ?? 0, enabled && Boolean(parsed));

  if (!parsed) return <>{rawValue}</>;
  return <>{`${formatWithCommas(animated)}${parsed.suffix}`}</>;
};

export const AboutSection = () => {
  const { ref, inView } = useInViewToggle();

  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>About Us</SectionLabel>
          <Title>
            <TitleMuted>함께 성장하고 싶은 {"\n"}</TitleMuted>
            <TitleHighlight>PM, 디자이너, 개발자</TitleHighlight>
            <TitleMuted>{`가 모여 \nDDD에서 프로젝트를 만들어요.`}</TitleMuted>
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
