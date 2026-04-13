'use client';

import styled from '@emotion/styled';
import { assets } from '@/constants/assets';
import { colors, fontWeights } from '@/constants/tokens';
import { recruitCurriculum } from '@/constants/recruit';

const Section = styled.section({
  position: 'relative',
  background: colors.background,
  padding: '120px 320px',
  overflow: 'hidden',

  '@media (max-width: 1024px)': { padding: '120px 80px' },
  '@media (max-width: 768px)': { padding: '100px 48px' },
  '@media (max-width: 375px)': { padding: '80px 20px' },
});

const Title = styled.h2({
  margin: 0,
  textAlign: 'center',
  color: colors.textInverse,
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '36px', lineHeight: '45px' },
  '@media (max-width: 375px)': { fontSize: '28px', lineHeight: '32px' },
});

const Grid = styled.div({
  marginTop: '40px',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',

  '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
});

const Item = styled.article({
  borderBottom: '1px solid #90a1b9',
  minHeight: '268px',
  padding: '32px 0 62px',
  display: 'grid',
  gridTemplateColumns: '84px 1fr',
  gap: '32px',
  position: 'relative',
  zIndex: 1,

  '@media (max-width: 375px)': {
    minHeight: 'auto',
    gridTemplateColumns: '60px 1fr',
    gap: '16px',
    padding: '22px 0 28px',
  },
});

const Week = styled.p({
  margin: 0,
  color: '#90a1b9',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 375px)': { fontSize: '14px', lineHeight: '18px' },
});

const DateText = styled.p({
  margin: 0,
  color: '#90a1b9',
  fontSize: '24px',
  lineHeight: '30px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 375px)': { fontSize: '16px', lineHeight: '20px' },
});

const ItemTitle = styled.h3({
  margin: '16px 0 0',
  color: colors.textInverse,
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '34px', lineHeight: '42px' },
  '@media (max-width: 375px)': { fontSize: '22px', lineHeight: '28px', marginTop: '8px' },
});

const Description = styled.p({
  margin: '16px 0 0',
  color: colors.textInverse,
  fontSize: '24px',
  lineHeight: '30px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 375px)': { fontSize: '14px', lineHeight: '18px', marginTop: '10px' },
});

const Floating3D = styled.img({
  position: 'absolute',
  left: '50%',
  top: '38%',
  width: '610px',
  transform: 'translateX(-50%) rotate(6deg)',
  opacity: 0.4,
  pointerEvents: 'none',

  '@media (max-width: 768px)': { width: '420px', top: '46%' },
  '@media (max-width: 375px)': { width: '250px', top: '50%' },
});

export const RecruitCurriculumSection = () => {
  return (
    <Section>
      <Title>13기 커리큘럼</Title>
      <Floating3D src={assets.recruit3d} alt="" />
      <Grid>
        {recruitCurriculum.map((item) => (
          <Item key={`${item.week}-${item.title}`}>
            <Week>{item.week}</Week>
            <div>
              <DateText>{item.date}</DateText>
              <ItemTitle>{item.title}</ItemTitle>
              <Description>{item.description}</Description>
            </div>
          </Item>
        ))}
      </Grid>
    </Section>
  );
};
