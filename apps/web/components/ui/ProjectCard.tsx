'use client';

import styled from '@emotion/styled';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

interface ProjectCardProps {
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  generation: string;
}

const Card = styled.div({
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  borderRadius: '30px',
  flex: '1 0 0',
  minWidth: '336px',
  maxWidth: '411px',
  overflow: 'hidden',
});

const Thumbnail = styled.div({
  position: 'relative',
  width: '100%',
  height: '260px',
  flexShrink: 0,

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const CardBody = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '20px 24px',
});

const CardTexts = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const CardTitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const CardDescription = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.textSecondary,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

const BadgeRow = styled.div({
  display: 'flex',
  gap: '12px',
});

const CategoryBadge = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 20px',
  background: colors.mainLight,
  borderRadius: '30px',
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  color: colors.primary,
  whiteSpace: 'nowrap',
});

const GenerationBadge = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 20px',
  background: colors.categoryBg,
  borderRadius: '30px',
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  color: colors.textSecondary,
  whiteSpace: 'nowrap',
});

export const ProjectCard = ({ title, description, thumbnail, category, generation }: ProjectCardProps) => {
  return (
    <Card>
      <Thumbnail>
        <img src={thumbnail} alt={title} />
      </Thumbnail>
      <CardBody>
        <CardTexts>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardTexts>
        <BadgeRow>
          <CategoryBadge>{category}</CategoryBadge>
          <GenerationBadge>{generation}</GenerationBadge>
        </BadgeRow>
      </CardBody>
    </Card>
  );
};
