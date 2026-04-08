'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const ARTICLES = [
  {
    id: '1',
    title: '픽셀을 넘어 공간으로: AI 시대, 디자이너가 XR에 주목해야 하는 이유',
    description:
      "오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다. 오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다.",
    thumbnail: assets.blogThumbnails[0],
  },
  {
    id: '2',
    title: '픽셀을 넘어 공간으로: AI 시대, 디자이너가 XR에 주목해야 하는 이유',
    description:
      "오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다. 오늘은 요즘 디자이너들 사이에서 가장 뜨거운 화두인 'AI', 그리고 그 너머의 'Next Generation'에 대해 이야기해 보려 합니다.",
    thumbnail: assets.blogThumbnails[1],
  },
] as const;

const Section = styled.section({
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '120px 40px',
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1280px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
});

const TitleArea = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.textInverse,
});

const TitleGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingXl,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingXl,
  color: colors.textInverse,
});

const SectionSubtitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,
});

const ArticleList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
});

const ArticleCard = styled.article({
  display: 'flex',
  gap: '25px',
  alignItems: 'center',
  background: 'white',
  borderRadius: '30px',
  overflow: 'hidden',
  height: '324px',
  paddingRight: '25px',
});

const ArticleThumbnail = styled.div({
  width: '410px',
  height: '100%',
  flexShrink: 0,

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ArticleContent = styled.div({
  flex: '1 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minWidth: 0,
});

const ArticleTitle = styled.h3({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textPrimary,
});

const ArticleDescription = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.textSecondary,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
});

const ContentAndButton = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
});

const MoreButton = styled(Link)({
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

export const BlogSection = () => {
  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>Article</SectionLabel>
          <TitleGroup>
            <SectionTitle>일잘러들의 생각, 글로 남겼어요</SectionTitle>
            <SectionSubtitle>
              트렌드 분석, 실무 인사이트, 커리어 고민까지. DDD 멤버들이 직접 쓴 아티클을 먼저 만나보세요.
            </SectionSubtitle>
          </TitleGroup>
        </TitleArea>
        <ContentAndButton>
          <ArticleList>
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
          <MoreButton href="/blog">
            더 알아보기
            <img src={assets.arrowLeft} alt="" width={24} height={24} />
          </MoreButton>
        </ContentAndButton>
      </Inner>
    </Section>
  );
};
