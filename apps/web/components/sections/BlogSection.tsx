"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

const ARTICLES = [
  {
    id: "1",
    title: "픽셀을 넘어 공간으로: AI 시대, 디자이너가 XR에 주목해야 하는 이유",
    description:
      "오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다. 오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다.",
    thumbnail: assets.blogThumbnails[0],
  },
  {
    id: "2",
    title: "픽셀을 넘어 공간으로: AI 시대, 디자이너가 XR에 주목해야 하는 이유",
    description:
      "오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다. 오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다.",
    thumbnail: assets.blogThumbnails[1],
  },
] as const;

const Section = styled.section({
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "120px 80px",

  "@media (max-width: 1024px)": { padding: "120px 80px" },
  "@media (max-width: 768px)": { padding: "100px 40px" },
  "@media (max-width: 375px)": { padding: "80px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

const TitleArea = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "24px",

  "@media (max-width: 375px)": {
    gap: "16px",
  },
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.textInverse,

  "@media (max-width: 375px)": {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
  },
});

const TitleGroup = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingXl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingXl,
  color: colors.textInverse,

  "@media (max-width: 768px)": {
    fontSize: "30px",
    lineHeight: "36px",
  },
  "@media (max-width: 375px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
});

const SectionSubtitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,

  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
  "@media (max-width: 375px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const ArticleList = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  width: "100%",

  "@media (max-width: 768px)": {
    flexDirection: "row",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    gap: "12px",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",

    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

const ArticleCard = styled.article({
  display: "flex",
  gap: "25px",
  alignItems: "center",
  background: "white",
  borderRadius: "30px",
  overflow: "hidden",
  height: "324px",
  paddingRight: "25px",

  "@media (max-width: 768px)": {
    height: "189px",
    borderRadius: "20px",
    padding: "20px",
    minWidth: "100%",
    flex: "0 0 100%",
    scrollSnapAlign: "start",
  },
});

const ArticleThumbnail = styled.div({
  width: "410px",
  height: "100%",
  flexShrink: 0,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  "@media (max-width: 768px)": {
    display: "none",
  },
});

const ArticleContent = styled.div({
  flex: "1 0 0",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  minWidth: 0,

  "@media (max-width: 768px)": {
    padding: 0,
  },
});

const ArticleTitle = styled.h3({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textPrimary,

  "@media (max-width: 768px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const ArticleDescription = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.textSecondary,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",

  "@media (max-width: 768px)": {
    fontSize: "14px",
    lineHeight: "18px",
    WebkitLineClamp: 2,
  },
  "@media (max-width: 375px)": {
    fontSize: "12px",
    lineHeight: "15px",
  },
});

const ContentAndButton = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px",
});

const MobileBulletRow = styled.div({
  display: "none",

  "@media (max-width: 768px)": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
});

const MobileBullet = styled.button<{ active: boolean }>(({ active }) => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: active ? colors.slate500 : colors.slate200,
  opacity: active ? 1 : 0.9,
  border: "none",
  padding: 0,
  cursor: "pointer",
}));

const MoreButton = styled(Link)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  height: "80px",
  padding: "20px 50px",
  background: colors.primary,
  borderRadius: "100px",
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  textDecoration: "none",
  whiteSpace: "nowrap",
  flexShrink: 0,
  transition: "background 0.15s",

  "&:hover": {
    background: "#1f5fe0",
  },

  "@media (max-width: 768px)": {
    height: "68px",
    padding: "16px 36px",
    fontSize: "18px",
    lineHeight: "24px",
  },
  "@media (max-width: 375px)": {
    height: "56px",
    padding: "30px 40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

export const BlogSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const articleListRef = useRef<HTMLDivElement | null>(null);

  const updateActiveSlide = useCallback(() => {
    const container = articleListRef.current;
    if (!container) return;

    const slides = Array.from(container.children) as HTMLElement[];
    if (slides.length === 0) return;

    const scrollLeft = container.scrollLeft;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveSlide(nearestIndex);
  }, []);

  const handleBulletClick = useCallback((index: number) => {
    const container = articleListRef.current;
    if (!container) return;

    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;

    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveSlide(index);
  }, []);

  useEffect(() => {
    const container = articleListRef.current;
    if (!container) return;

    const onScroll = () => updateActiveSlide();
    container.addEventListener("scroll", onScroll, { passive: true });
    let raf = 0;
    raf = requestAnimationFrame(() => updateActiveSlide());

    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [updateActiveSlide]);

  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>Article</SectionLabel>
          <TitleGroup>
            <SectionTitle>일잘러들의 생각, 글로 남겼어요</SectionTitle>
            <SectionSubtitle>
              트렌드 분석, 실무 인사이트, 커리어 고민까지. DDD 멤버들이 직접 쓴 아티클을 먼저
              만나보세요.
            </SectionSubtitle>
          </TitleGroup>
        </TitleArea>
        <ContentAndButton>
          <ArticleList ref={articleListRef}>
            {ARTICLES.map(({ id, title, description, thumbnail }) => (
              <ArticleCard key={id}>
                <ArticleThumbnail>
                  <img src={thumbnail} alt={title} />
                </ArticleThumbnail>
                <ArticleContent>
                  <ArticleTitle>{title}</ArticleTitle>
                  <ArticleDescription>{description}</ArticleDescription>
                </ArticleContent>
              </ArticleCard>
            ))}
          </ArticleList>
          <MobileBulletRow>
            {ARTICLES.map(({ id }, index) => (
              <MobileBullet
                key={id}
                active={activeSlide === index}
                aria-label={`${index + 1}번 아티클로 이동`}
                onClick={() => handleBulletClick(index)}
              />
            ))}
          </MobileBulletRow>
          <MoreButton href="/blog">
            더 알아보기
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="white" />
            </svg>{" "}
          </MoreButton>
        </ContentAndButton>
      </Inner>
    </Section>
  );
};
