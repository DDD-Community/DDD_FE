"use client";

import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

/*
  이 카드를 쓰는 그리드(홈 ProjectsSection)의 한 칸 크기. 최대 1280px 에 3열·간격
  24px 이라 약 427px 이고, 1024 이하 2열 / 767 이하 1열로 바뀐다.
*/
const THUMBNAIL_SIZES = "(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 427px";

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
  // 그리드 행 높이를 채운다. 늘어나는 건 CardLink 뿐이라 이게 없으면
  // 짧은 카드 아래로 섹션 배경이 비친다.
  flex: 1,
});

const Thumbnail = styled.div({
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  flexShrink: 0,
  background: colors.categoryBg,

  // Card 가 column flex 라 이 박스는 flex 아이템이고, min-height 가 auto 면
  // 안쪽 img 의 원본 높이가 자동 최소 높이가 되어 위 aspectRatio 를 밀어낸다.
  // 세로형 썸네일(예: 401×498)만 카드가 100px 쯤 길어져 그리드 높이가 어긋났다.
  minHeight: 0,

  // img 가 inline 이면 baseline 아래 여백만큼 박스가 이미지보다 커져서
  // 썸네일 하단에 categoryBg 회색 띠가 드러난다. block 으로 그린다.
  "& img": {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    // 썸네일은 카피가 맨 위에 있는 포스터형이다. 4:5 원본(13기는 전부 1620×2008)이
    // 1:1 박스에 들어오면 세로 20% 가 잘리는데, 가운데 정렬이면 위 10% 를 먹어
    // 카피가 글자 중간에서 끊긴다. 위를 붙여 세로 크롭이 아래쪽만 먹게 한다.
    objectPosition: "top",
  },
});

const CardBody = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "20px 24px",
  flex: 1,
});

const CardTexts = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const CardTitle = styled.p({
  fontFamily: "var(--font-pretendard), sans-serif",
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

  "@media (max-width: 767px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const CardDescription = styled.p({
  fontFamily: "var(--font-pretendard), sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.textSecondary,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  // 설명이 1줄인 카드와 2줄인 카드의 본문 높이가 달라지지 않도록 항상 2줄을 차지한다.
  minHeight: "40px",
  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
    minHeight: "36px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "18px",
    minHeight: "36px",
  },

  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "15px",
    minHeight: "30px",
  },
});

const BadgeRow = styled.div({
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  // 카드가 늘어나도 뱃지 줄은 카드 바닥에 붙어 나란히 정렬된다.
  marginTop: "auto",
  paddingTop: "2px",
});

const CategoryBadge = styled.span({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 20px",
  background: colors.mainLight,
  borderRadius: "30px",
  fontFamily: "var(--font-pretendard), sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: "28px",
  color: colors.primary,
  whiteSpace: "nowrap",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "24px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const GenerationBadge = styled.span({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 20px",
  background: colors.categoryBg,
  borderRadius: "30px",
  fontFamily: "var(--font-pretendard), sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  color: colors.textSecondary,
  whiteSpace: "nowrap",
  lineHeight: "28px",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "24px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const CardLink = styled(Link)({
  display: "flex",
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
      {thumbnail ? <Image src={thumbnail} alt={title} fill sizes={THUMBNAIL_SIZES} /> : null}
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
