"use client";

import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { recruitSchedules } from "@/constants/recruit";

const Section = styled.section({
  background: colors.background,
  padding: "80px 80px",

  "@media (max-width: 1024px)": { padding: "80px 80px" },
  "@media (max-width: 768px)": { padding: "80px 40px" },
  "@media (max-width: 375px)": { padding: "40px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
});

const Title = styled.h2({
  margin: 0,
  color: colors.textInverse,
  textAlign: "center",
  fontSize: "clamp(28px, calc(1.54vw + 22.22px), 40px)",
  lineHeight: "clamp(32px, calc(2.47vw + 22.76px), 50px)",
  fontWeight: fontWeights.bold,
});

const List = styled.div({
  marginTop: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",

  "@media (max-width: 375px)": {
    marginTop: "20px",
    gap: "12px",
  },
});

const Item = styled.article({
  background: colors.backgroundDark,
  borderRadius: "30px",
  boxShadow: "inset 3px 3px 25px 0 rgba(146, 146, 146, 0.25)",
  padding: "40px",
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  alignItems: "center",

  "@media (max-width: 768px)": { gridTemplateColumns: "100px 1fr", gap: "28px", padding: "28px" },
  "@media (max-width: 375px)": {
    gridTemplateColumns: "54px 1fr",
    gap: "14px",
    borderRadius: "20px",
    padding: "20px 16px",
  },
});

const Step = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "clamp(24px, calc(4.93vw + 5.51px), 64px)",
  lineHeight: "clamp(28px, calc(5.55vw + 7.19px), 75px)",
  fontWeight: fontWeights.bold,
  "@media (max-width: 768px)": { fontSize: "48px", lineHeight: "56px" },
  "@media (max-width: 375px)": { fontSize: "24px", lineHeight: "28px" },
});

const Label = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "clamp(14px, calc(1.849vw + 7.07px), 28px)",
  lineHeight: "clamp(18px, calc(1.849vw + 11.07px), 32px)",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 768px)": { fontSize: "24px", lineHeight: "28px" },
  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
});

const DateText = styled.p({
  margin: 0,
  marginTop: "10px",
  color: colors.textInverse,
  fontSize: "clamp(14px, calc(3.082vw + 2.44px), 40px)",
  lineHeight: "clamp(18px, calc(3.699vw + 4.13px), 50px)",
  fontWeight: fontWeights.bold,
  "@media (max-width: 768px)": { fontSize: "28px", lineHeight: "36px" },
  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px", marginTop: "6px" },
});

export const RecruitScheduleSection = () => {
  return (
    <Section>
      <Inner>
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
      </Inner>
    </Section>
  );
};
