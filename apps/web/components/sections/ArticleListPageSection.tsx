'use client';

import styled from '@emotion/styled';
import { articles, articleBanner } from '@/constants/articles';
import { fontWeights } from '@/constants/tokens';

const Section = styled.section({
  background: '#fff',
});

const Banner = styled.div({
  minHeight: '330px',
  padding: '160px 320px 80px',
  backgroundImage: `url('${articleBanner.desktop}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'flex-end',

  '@media (max-width: 1024px)': {
    padding: '160px 80px 80px',
    backgroundImage: `url('${articleBanner.tablet}')`,
  },
  '@media (max-width: 768px)': {
    padding: '140px 40px 50px',
    minHeight: '300px',
  },
  '@media (max-width: 375px)': {
    padding: '160px 16px 20px',
    minHeight: '300px',
  },
});

const BannerLabel = styled.p({
  margin: 0,
  color: '#62748e',
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: fontWeights.semiBold,
  '@media (max-width: 1024px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '20px' },
  '@media (max-width: 375px)': { fontSize: '12px', lineHeight: '15px' },
});

const BannerTitle = styled.h1({
  margin: '8px 0 0',
  color: '#cad5e2',
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,
  '@media (max-width: 1024px)': { fontSize: '34px', lineHeight: '45px' },
  '@media (max-width: 768px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 375px)': { width: '265px', fontSize: '24px', lineHeight: '30px' },
});

const Body = styled.div({
  padding: '80px 320px',
  '@media (max-width: 1024px)': { padding: '80px' },
  '@media (max-width: 768px)': { padding: '48px 40px' },
  '@media (max-width: 375px)': { padding: '40px 16px' },
});

const List = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const Row = styled.article({
  display: 'grid',
  gridTemplateColumns: '410px 1fr',
  alignItems: 'center',
  gap: '24px',
  padding: '40px 0',
  borderBottom: '1px solid #c9c9c9',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: '340px 1fr',
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
    gap: '16px',
    padding: '28px 0',
  },
});

const Thumbnail = styled.img({
  width: '100%',
  height: '324px',
  objectFit: 'cover',
  borderRadius: '30px',
  display: 'block',

  '@media (max-width: 1024px)': {
    height: '260px',
  },
  '@media (max-width: 768px)': {
    height: '220px',
    borderRadius: '20px',
  },
  '@media (max-width: 375px)': {
    height: '189px',
    borderRadius: '16px',
  },
});

const TextWrap = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minWidth: 0,
});

const Title = styled.h2({
  margin: 0,
  color: '#202325',
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: fontWeights.semiBold,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  '@media (max-width: 1024px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 768px)': { fontSize: '20px', lineHeight: '25px' },
  '@media (max-width: 375px)': { fontSize: '18px', lineHeight: '25px' },
});

const Description = styled.p({
  margin: 0,
  color: '#525252',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',

  '@media (max-width: 1024px)': { fontSize: '18px', lineHeight: '23px' },
  '@media (max-width: 768px)': { fontSize: '14px', lineHeight: '18px' },
});

const Pagination = styled.div({
  marginTop: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '40px',
  color: '#d4d4d4',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 768px)': {
    marginTop: '48px',
    gap: '24px',
    fontSize: '14px',
    lineHeight: '18px',
  },
});

const Arrow = styled.span({
  color: '#cad5e2',
  fontSize: '18px',
});

export const ArticleListPageSection = () => {
  return (
    <Section>
      <Banner>
        <div>
          <BannerLabel>Article</BannerLabel>
          <BannerTitle>DDD에서 발행된 아티클을 공유합니다.</BannerTitle>
        </div>
      </Banner>
      <Body>
        <List>
          {articles.map((article) => (
            <Row key={article.id}>
              <Thumbnail src={article.thumbnail} alt={article.title} />
              <TextWrap>
                <Title>{article.title}</Title>
                <Description>{article.description}</Description>
              </TextWrap>
            </Row>
          ))}
        </List>
        <Pagination>
          <Arrow>‹</Arrow>
          <span style={{ color: '#525252' }}>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <Arrow>›</Arrow>
        </Pagination>
      </Body>
    </Section>
  );
};
