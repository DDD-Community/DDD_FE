'use client';

import styled from '@emotion/styled';
import { Fragment } from 'react';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

const SOCIAL_LINKS = [
  { label: 'Tistory', icon: assets.social.tistory, href: 'https://ddd.tistory.com' },
  { label: 'Medium', icon: assets.social.medium, href: 'https://medium.com/ddd-club' },
  { label: 'Brunch', icon: assets.social.brunch, href: 'https://brunch.co.kr/@ddd' },
] as const;

const FooterWrapper = styled.footer({
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '80px 320px',
  gap: '40px',

  '@media (max-width: 1024px)': {
    padding: '80px',
  },
  '@media (max-width: 768px)': {
    padding: '56px 40px',
  },
  '@media (max-width: 375px)': {
    padding: '40px 16px',
    gap: '24px',
  },
});

const FooterInner = styled.div({
  width: '100%',
  maxWidth: '1920px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
});

const FooterTop = styled.div({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '80px',
  justifyContent: 'center',

  '@media (max-width: 375px)': {
    gap: '24px',
    justifyContent: 'flex-start',
  },
});

const FooterSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const FooterLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.small,
  color: colors.textInverse,
});

const FooterEmail = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,

  '@media (max-width: 375px)': {
    fontSize: '20px',
    lineHeight: '25px',
  },
});

const SocialLinks = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '16px',
});

const SocialLink = styled.a({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,
  textDecoration: 'none',

  '&:hover': {
    opacity: 0.8,
  },

  '@media (max-width: 375px)': {
    fontSize: '20px',
    lineHeight: '25px',
  },
});

const Divider = styled.span({
  width: '1px',
  height: '14px',
  background: colors.textInverse,
  opacity: 0.4,
});

const Copyright = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
  color: colors.textInverse,
  textAlign: 'center',
});

export const Footer = () => {
  return (
    <FooterWrapper>
      <FooterInner>
        <FooterTop>
          <FooterSection>
            <FooterLabel>Email</FooterLabel>
            <FooterEmail>dddstudy1@gmail.com</FooterEmail>
          </FooterSection>
          <FooterSection>
            <FooterLabel>Follow us</FooterLabel>
            <SocialLinks>
              {SOCIAL_LINKS.map(({ label, icon, href }, index) => (
                <Fragment key={label}>
                  {index > 0 && <Divider />}
                  <SocialLink href={href} target="_blank" rel="noopener noreferrer">
                    <img src={icon} alt="" width={24} height={24} />
                    {label}
                  </SocialLink>
                </Fragment>
              ))}
            </SocialLinks>
          </FooterSection>
        </FooterTop>
        <Copyright>©2026 DDD. All Rights Reserved.</Copyright>
      </FooterInner>
    </FooterWrapper>
  );
};
