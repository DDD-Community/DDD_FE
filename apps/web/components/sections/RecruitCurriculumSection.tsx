"use client";

import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import { colors, fontWeights } from "@/constants/tokens";
import { recruitCurriculum } from "@/constants/recruit";

const Section = styled.section({
  background: colors.background,
  padding: "80px 80px",
  overflow: "hidden",

  "@media (max-width: 1024px)": { padding: "80px 80px" },
  "@media (max-width: 768px)": { padding: "80px 40px" },
  "@media (max-width: 375px)": { padding: "40px 16px" },
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

  "@media (max-width: 768px)": { fontSize: "36px", lineHeight: "45px" },
  "@media (max-width: 375px)": { fontSize: "28px", lineHeight: "32px" },
});

const Grid = styled.div({
  marginTop: "40px",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "24px",

  "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  "@media (max-width: 375px)": { marginTop: "20px", gap: "8px" },
});

const Item = styled.article({
  borderBottom: "1px solid #90a1b9",
  minHeight: "268px",
  padding: "32px 0 62px",
  display: "grid",
  gridTemplateColumns: "84px 1fr",
  gap: "32px",
  position: "relative",
  zIndex: 1,

  "@media (max-width: 375px)": {
    width: "337px",
    minHeight: "187px",
    gridTemplateColumns: "60px 1fr",
    gap: "12px",
    padding: "20px 0",
    margin: "0 auto",
  },
});

const Week = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
});

const DateText = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
});

const ItemTitle = styled.h3({
  margin: "16px 0 0",
  color: colors.textInverse,
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,

  "@media (max-width: 768px)": { fontSize: "34px", lineHeight: "42px" },
  "@media (max-width: 375px)": { fontSize: "20px", lineHeight: "25px", marginTop: "8px" },
});

const Description = styled.p({
  margin: "16px 0 0",
  color: colors.textInverse,
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 375px)": { fontSize: "12px", lineHeight: "16px", marginTop: "8px" },
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
  "@media (max-width: 375px)": { width: "220px", top: "56%" },
});

export const RecruitCurriculumSection = () => {
  return (
    <Section>
      <Inner>
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
      </Inner>
    </Section>
  );
};
