'use client';

import styled from '@emotion/styled';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const StyledButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  height: '80px',
  padding: '20px 50px',
  background: colors.primary,
  border: 'none',
  borderRadius: '100px',
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,

  '&:hover': {
    background: '#1f5fe0',
  },

  '@media (max-width: 768px)': {
    height: '68px',
    padding: '16px 36px',
    fontSize: '18px',
    lineHeight: '24px',
  },
  '@media (max-width: 375px)': {
    height: '56px',
    padding: '14px 24px',
    fontSize: '14px',
    lineHeight: '18px',
  },
});

export const Button = ({ children, onClick, type = 'button' }: ButtonProps) => {
  return (
    <StyledButton type={type} onClick={onClick}>
      {children}
    </StyledButton>
  );
};
