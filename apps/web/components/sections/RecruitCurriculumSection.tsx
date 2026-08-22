"use client";

import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { colors, fontWeights } from "@/constants/tokens";
import type { RecruitCurriculumItem } from "@/lib/mappers/recruit";

const Section = styled.section({
  background: colors.background,
  padding: "80px 80px",
  overflow: "hidden",

  "@media (max-width: 1024px)": { padding: "80px 80px" },
  "@media (max-width: 768px)": { padding: "80px 40px" },
  "@media (max-width: 767px)": { padding: "40px 16px" },
});

const Inner = styled.div({
  position: "relative",
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
});

const Title = styled.h2({
  margin: 0,
  textAlign: "center",
  color: colors.textInverse,
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 767px)": { fontSize: "20px", lineHeight: "25px" },
});

const Grid = styled.div({
  marginTop: "40px",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "24px",
  width: "100%",

  "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  "@media (max-width: 767px)": { marginTop: "20px", gap: "8px" },
});

const Item = styled.article({
  borderBottom: "1px solid #90a1b9",
  minHeight: "268px",
  padding: "32px 0 62px",
  display: "grid",
  // minmax(0, 1fr): 콘텐츠 최소 너비로 그리드가 뷰포트를 밀어내지 않도록 함
  gridTemplateColumns: "minmax(0, 1fr) 84px",
  gap: "32px",
  position: "relative",
  zIndex: 1,
  minWidth: 0,
  width: "100%",
  maxWidth: "100%",

  "@media (max-width: 767px)": {
    minHeight: "187px",
    gridTemplateColumns: "minmax(0, 1fr) 60px",
    gap: "12px",
    padding: "20px 0",
  },
});

const ItemBody = styled.div({
  minWidth: 0,
  overflowWrap: "break-word",
});

const Week = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  textAlign: "right",

  "@media (max-width: 1024px)": { fontSize: "18px", lineHeight: "23px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "20px" },
  "@media (max-width: 767px)": { fontSize: "14px", lineHeight: "18px" },
});

const DateText = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 1024px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 768px)": { fontSize: "18px", lineHeight: "24px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const ItemTitle = styled.h3({
  margin: "16px 0 0",
  color: colors.textInverse,
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,

  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 767px)": { fontSize: "20px", lineHeight: "25px" },
});

const Description = styled.p({
  margin: "16px 0 0",
  color: colors.textInverse,
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 1024px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 768px)": { fontSize: "18px", lineHeight: "24px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const Floating3D = styled.img({
  position: "absolute",
  left: "50%",
  top: "38%",
  width: "610px",
  transform: "translateX(-50%) rotate(6deg)",
  opacity: 0.4,
  pointerEvents: "none",

  "@media (max-width: 768px)": { width: "420px", top: "46%" },
  "@media (max-width: 767px)": { width: "220px", top: "56%" },
});

export const RecruitCurriculumSection = ({
  cohortName,
  curriculum,
}: {
  cohortName: string | null;
  curriculum: RecruitCurriculumItem[];
}) => {
  // 일정 섹션과 같은 이유로, 커리큘럼이 비어 있으면 지난 기수 내용 대신 아무것도
  // 노출하지 않는다.
  if (curriculum.length === 0) return null;

  return (
    <Section>
      <Inner>
        <Title>{cohortName ? `${cohortName} 커리큘럼` : "커리큘럼"}</Title>
        <Floating3D src={assets.recruit3d} alt="" />
        <Grid>
          {curriculum.map((item) => (
            <Item key={item.week}>
              <ItemBody>
                <DateText>{item.date}</DateText>
                <ItemTitle>{item.title}</ItemTitle>
                {item.description ? <Description>{item.description}</Description> : null}
              </ItemBody>
              <Week>{item.week}</Week>
            </Item>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
};
