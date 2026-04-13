'use client';

import styled from '@emotion/styled';
import { colors, fontWeights } from '@/constants/tokens';
import { recruitSchedules } from '@/constants/recruit';

const Section = styled.section({
  background: colors.background,
  padding: '120px 320px',

  '@media (max-width: 1024px)': { padding: '120px 80px' },
  '@media (max-width: 768px)': { padding: '100px 48px' },
  '@media (max-width: 375px)': { padding: '80px 20px' },
});

const Title = styled.h2({
  margin: 0,
  color: colors.textInverse,
  textAlign: 'center',
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '36px', lineHeight: '45px' },
  '@media (max-width: 375px)': { fontSize: '28px', lineHeight: '32px' },
});

const List = styled.div({
  marginTop: '40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const Item = styled.article({
  background: colors.backgroundDark,
  borderRadius: '30px',
  boxShadow: 'inset 3px 3px 25px 0 rgba(146, 146, 146, 0.25)',
  padding: '40px',
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  alignItems: 'center',
  gap: '56px',

  '@media (max-width: 768px)': { gridTemplateColumns: '100px 1fr', gap: '28px', padding: '28px' },
  '@media (max-width: 375px)': { gridTemplateColumns: '64px 1fr', gap: '16px', borderRadius: '20px', padding: '20px' },
});

const Step = styled.p({
  margin: 0,
  color: '#90a1b9',
  fontSize: '64px',
  lineHeight: '75px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '48px', lineHeight: '56px' },
  '@media (max-width: 375px)': { fontSize: '32px', lineHeight: '40px' },
});

const Label = styled.p({
  margin: 0,
  color: '#90a1b9',
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: fontWeights.semiBold,

  '@media (max-width: 768px)': { fontSize: '24px', lineHeight: '28px' },
  '@media (max-width: 375px)': { fontSize: '16px', lineHeight: '20px' },
});

const DateText = styled.p({
  margin: 0,
  marginTop: '10px',
  color: colors.textInverse,
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '28px', lineHeight: '36px' },
  '@media (max-width: 375px)': { fontSize: '18px', lineHeight: '24px' },
});

export const RecruitScheduleSection = () => {
  return (
    <Section>
      <Title>13기 모집 일정</Title>
      <List>
        {recruitSchedules.map((item) => (
          <Item key={item.step}>
            <Step>{item.step}</Step>
            <div>
              <Label>{item.label}</Label>
              <DateText>{item.date}</DateText>
            </div>
          </Item>
        ))}
      </List>
    </Section>
  );
};
