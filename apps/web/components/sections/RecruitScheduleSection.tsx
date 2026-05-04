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
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 375px)": { fontSize: "20px", lineHeight: "25px" },
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
  display: "flex",
  alignItems: "center",
  gap: "56px",

  "@media (max-width: 768px)": { padding: "40px" },
  "@media (max-width: 375px)": {
    padding: "24px",
    gap: "40px",
  },
});

const Step = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "64px",
  lineHeight: "75px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "54px", lineHeight: "65px" },
  "@media (max-width: 768px)": { fontSize: "42px", lineHeight: "52px" },
  "@media (max-width: 375px)": { fontSize: "38px", lineHeight: "48px" },
});

const Label = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px" },
});

const DateText = styled.p({
  margin: 0,
  marginTop: "10px",
  color: colors.textInverse,
  fontSize: "40px ",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 575px)": { fontSize: "20px", lineHeight: "25px", marginTop: "6px" },
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
