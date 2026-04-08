'use client';

import styled from '@emotion/styled';
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
  padding: '100px 40px',
  gap: '40px',
});

const FooterInner = styled.div({
  width: '100%',
  maxWidth: '1280px',
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
                <>
                  {index > 0 && <Divider key={`divider-${label}`} />}
                  <SocialLink key={label} href={href} target="_blank" rel="noopener noreferrer">
                    <img src={icon} alt="" width={24} height={24} />
                    {label}
                  </SocialLink>
                </>
              ))}
            </SocialLinks>
          </FooterSection>
        </FooterTop>
        <Copyright>©2026 DDD. All Rights Reserved.</Copyright>
      </FooterInner>
    </FooterWrapper>
  );
};
