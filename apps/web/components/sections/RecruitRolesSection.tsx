"use client";

import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { recruitParts } from "@/constants/recruit";
import { useRecruitStatus } from "@/components/providers/RecruitStatusProvider";

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
  "@media (max-width: 1024px)": {
    fontSize: "34px",
    lineHeight: "45px",
  },
  "@media (max-width: 768px)": {
    fontSize: "30px",
    lineHeight: "38px",
  },
  "@media (max-width: 375px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
});

const Grid = styled.div({
  marginTop: "40px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "24px",

  "@media (max-width: 768px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (max-width: 525px)": {
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
});

const Card = styled.article<{ isRecruitOpen: boolean }>(({ isRecruitOpen }) => ({
  minHeight: "224px",
  borderRadius: "30px",
  padding: "40px",
  background: colors.backgroundDark,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  textAlign: "center",
  transition: "background 0.2s ease",

  ...(isRecruitOpen
    ? {
        "&:hover, &:focus-within": {
          background: colors.primary,
        },
      }
    : {}),

  "@media (max-width: 375px)": {
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
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px" },
});

const RoleDescription = styled.p<{ isRecruitOpen: boolean }>(({ isRecruitOpen }) => ({
  margin: 0,
  color: colors.mainLight,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  maxHeight: 0,
  opacity: 0,
  overflow: "hidden",
  transition: "max-height 0.2s ease, opacity 0.15s ease, margin-top 0.2s ease",
  marginTop: 0,

  ...(isRecruitOpen
    ? {
        ".role-card:hover &, .role-card:focus-within &": {
          maxHeight: "120px",
          opacity: 1,
          marginTop: "4px",
        },
      }
    : {}),

  "@media (max-width: 1024px)": { fontSize: "18px", lineHeight: "23px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "20px" },
  "@media (max-width: 375px)": { fontSize: "14px", lineHeight: "18px" },
}));

const ApplyButton = styled.button<{ isRecruitOpen: boolean }>(({ isRecruitOpen }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  width: "100%",
  height: "65px",
  borderRadius: "100px",
  background: "#62748e",
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,
  cursor: isRecruitOpen ? "pointer" : "default",
  transition: "background 0.2s ease",

  ...(isRecruitOpen
    ? {
        ".role-card:hover &, .role-card:focus-within &": {
          background: "#0a62bb",
        },

        "& svg": {
          width: "24px",
          height: "24px",
          flexShrink: 0,
        },
      }
    : {}),

  "@media (max-width: 1024px)": {
    height: "60px",
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    height: "52px",
    fontSize: "16px",
    lineHeight: "22px",
  },
  "@media (max-width: 375px)": {
    height: "40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
}));

export const RecruitRolesSection = () => {
  const { isRecruitOpen, recruitButtonLabels } = useRecruitStatus();

  return (
    <Section>
      <Inner>
        <Title>6개의 직군을 모집하고있어요.</Title>
        <Grid>
          {recruitParts.map((part) => {
            const description = "description" in part ? part.description : undefined;

            return (
              <Card key={part.name} isRecruitOpen={isRecruitOpen} className="role-card">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
                >
                  <RoleName>{part.name}</RoleName>
                  {description ? (
                    <RoleDescription isRecruitOpen={isRecruitOpen}>{description}</RoleDescription>
                  ) : null}
                </div>
                <ApplyButton type="button" isRecruitOpen={isRecruitOpen} disabled={!isRecruitOpen}>
                  {recruitButtonLabels.role}
                  {isRecruitOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"
                        fill="white"
                      />
                    </svg>
                  ) : null}
                </ApplyButton>
              </Card>
            );
          })}
        </Grid>
      </Inner>
    </Section>
  );
};
