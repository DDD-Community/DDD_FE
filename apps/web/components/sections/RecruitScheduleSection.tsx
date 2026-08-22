"use client";

import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import type { RecruitScheduleItem } from "@/lib/mappers/recruit";

const Section = styled.section({
  background: colors.background,
  padding: "80px 80px",

  "@media (max-width: 1024px)": { padding: "80px 80px" },
  "@media (max-width: 768px)": { padding: "80px 40px" },
  "@media (max-width: 767px)": { padding: "40px 16px" },
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
  "@media (max-width: 767px)": { fontSize: "20px", lineHeight: "25px" },
});

const List = styled.div({
  marginTop: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",

  "@media (max-width: 767px)": {
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
  // 375 프레임: 카드 패딩 24 / 라운드 20 / 번호-본문 간격 20, 번호는 본문 상단에 맞춘다.
  "@media (max-width: 767px)": {
    padding: "24px",
    borderRadius: "20px",
    gap: "20px",
    alignItems: "flex-start",
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
  "@media (max-width: 767px)": { fontSize: "38px", lineHeight: "48px" },
});

const Label = styled.p({
  margin: 0,
  color: "#90a1b9",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
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
  "@media (max-width: 767px)": { fontSize: "20px", lineHeight: "25px", marginTop: "10px" },
});

export const RecruitScheduleSection = ({
  cohortName,
  schedules,
}: {
  cohortName: string | null;
  schedules: RecruitScheduleItem[];
}) => {
  // 활성 기수가 없거나 운영진이 일정을 아직 입력하지 않은 경우 — 지난 기수 일정을
  // 노출하느니 섹션 자체를 감춘다.
  if (schedules.length === 0) return null;

  return (
    <Section>
      <Inner>
        <Title>{cohortName ? `${cohortName} 모집 일정` : "모집 일정"}</Title>
        <List>
          {schedules.map((item) => (
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
