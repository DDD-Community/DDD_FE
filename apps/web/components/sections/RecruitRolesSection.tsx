"use client";

import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { recruitParts } from "@/constants/recruit";

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
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "24px",

  "@media (max-width: 768px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (max-width: 375px)": {
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
});

const Card = styled.article<{ featured?: boolean }>(({ featured }) => ({
  minHeight: featured ? "360px" : "224px",
  borderRadius: "30px",
  padding: "40px",
  background: featured ? colors.primary : colors.backgroundDark,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  textAlign: "center",

  "@media (max-width: 375px)": {
    minHeight: featured ? "300px" : "185px",
    padding: "20px",
    borderRadius: "24px",
  },
}));

const RoleName = styled.h3({
  margin: 0,
  color: colors.textInverse,
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,

  "@media (max-width: 375px)": { fontSize: "24px", lineHeight: "28px" },
});

const RoleDescription = styled.p({
  margin: 0,
  color: colors.mainLight,
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
});

const ApplyButton = styled.button<{ featured?: boolean }>(({ featured }) => ({
  border: "none",
  width: "100%",
  height: "65px",
  borderRadius: "100px",
  background: featured ? "#0a62bb" : "#62748e",
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "@media (max-width: 375px)": {
    height: "40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
}));

export const RecruitRolesSection = () => {
  return (
    <Section>
      <Inner>
        <Title>6개의 직군을 모집하고있어요.</Title>
        <Grid>
          {recruitParts.map((part) => {
            const featured = "featured" in part ? part.featured : false;
            const description = "description" in part ? part.description : undefined;

            return (
            <Card key={part.name} featured={featured}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <RoleName>{part.name}</RoleName>
                {description ? <RoleDescription>{description}</RoleDescription> : null}
              </div>
              <ApplyButton type="button" featured={featured}>
                지원하기 →
              </ApplyButton>
            </Card>
            );
          })}
        </Grid>
      </Inner>
    </Section>
  );
};
