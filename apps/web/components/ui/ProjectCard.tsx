"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

interface ProjectCardProps {
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  generation: string;
  href?: string;
}

const Card = styled.div({
  display: "flex",
  flexDirection: "column",
  background: "white",
  borderRadius: "30px",
  width: "100%",
  overflow: "hidden",

  "@media (max-width: 1024px)": {
    width: "100%",
  },
  "@media (max-width: 768px)": {
    width: "100%",
  },
  "@media (max-width: 375px)": {
    borderRadius: "20px",
  },
});

const Thumbnail = styled.div({
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  flexShrink: 0,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  "@media (max-width: 375px)": {
    borderRadius: "20px",
    overflow: "hidden",
  },
});

const CardBody = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "20px 24px",

  "@media (max-width: 375px)": {
    padding: "16px",
  },
});

const CardTexts = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minHeight: "80px",
});

const CardTitle = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textPrimary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",

  "@media (max-width: 1024px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const CardDescription = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.textSecondary,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",

  "@media (max-width: 375px)": {
    fontSize: "12px",
    lineHeight: "15px",
  },
});

const BadgeRow = styled.div({
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "2px",
});

const CategoryBadge = styled.span({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 20px",
  background: colors.mainLight,
  borderRadius: "30px",
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  color: colors.primary,
  whiteSpace: "nowrap",

  "@media (max-width: 375px)": {
    fontSize: "14px",
    lineHeight: "18px",
    padding: "4px 20px",
  },
});

const GenerationBadge = styled.span({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 20px",
  background: colors.categoryBg,
  borderRadius: "30px",
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  color: colors.textSecondary,
  whiteSpace: "nowrap",

  "@media (max-width: 375px)": {
    fontSize: "14px",
    lineHeight: "18px",
    padding: "4px 20px",
  },
});

const CardLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const ProjectCardBody = ({
  title,
  description,
  thumbnail,
  category,
  generation,
}: Omit<ProjectCardProps, "href">) => (
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

export const ProjectCard = ({
  title,
  description,
  thumbnail,
  category,
  generation,
  href,
}: ProjectCardProps) => {
  const body = (
    <ProjectCardBody
      title={title}
      description={description}
      thumbnail={thumbnail}
      category={category}
      generation={generation}
    />
  );

  if (href) {
    return <CardLink href={href}>{body}</CardLink>;
  }

  return body;
};
