"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import styled from "@emotion/styled";
import { assets } from "@/constants/assets";
import {
  ApiError,
  APPLICATION_VERIFICATION_CODE_PATTERN,
  APPLICATION_VERIFICATION_CODE_TTL_SECONDS,
  APPLICATION_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  isApplicationAttachment,
} from "@ddd/api";
import type { ApplicationAttachmentDto } from "@ddd/api";
import { colors, fontWeights } from "@/constants/tokens";
import successIcon from "@/public/images/success.png";
import { fetchApplyParts, fetchApplyQuestions } from "@/lib/api/cohort";
import { type ApplyPart, type ApplyPartOption, type ApplyQuestion } from "@/lib/mappers/cohort";
import {
  confirmApplicationEmailVerification,
  fetchApplicationDraftAnswers,
  isUnauthorizedError,
  openApplicationAttachment,
  requestApplicationEmailVerification,
  saveRecruitApplicationDraft,
  submitRecruitApplication,
  uploadApplicationAttachment,
} from "@/lib/api/application";
import {
  birthInputToApiDate,
  formatApplicantPhoneKorea,
  formatBirthInput,
  formatPhoneInput,
} from "@/lib/format";

type Step = 1 | 2 | 3 | 4;
type BasicField = "name" | "email" | "phone" | "birth" | "region";

/**
 * 답변 1건.
 *
 * 서술형은 문자열, PDF 첨부 질문은 업로드 응답 객체 그대로다. 첨부는 개인정보라
 * 다운로드 URL 이 응답에 없고 `path` 만 오간다.
 */
type ApplyAnswer = string | ApplicationAttachmentDto;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  birth: string;
  region: string;
  agreedToPrivacy: boolean;
  part: string | null;
  /** 지원서 답변 — 키는 파트별 applicationSchema 질문의 `key` 다. */
  answers: Record<string, ApplyAnswer>;
};

const PART_DESCRIPTIONS: Record<ApplyPartOption, string> = {
  iOS: "Apple 생태계에 맞춰 안정적인 앱을 만들어요. 섬세한 디테일로 완성도 높은 경험을 설계해요.",
  AOS: "다양한 환경에서 안정적으로 동작하는 앱을 만들어요. 지속 성장 가능한 서비스를 함께 개발해요.",
  FE: "사용자 중심의 직관적이고 빠른 웹 환경을 구축합니다. 최적화된 코드로 끊김 없는 사용자 경험을 제공합니다.",
  BE: "서버와 데이터의 흐름을 설계해 서비스가 안정적으로 동작하도록 만들어요. 성능과 확장성을 고려해 빠르고 유연한 시스템을 구축해요.",
  PM: "문제를 정의하고 방향을 제시해 팀이 같은 목표를 향해 나아가도록 이끌어요. 우선순위를 정하고 실행을 조율해 제품 가치를 만듭니다.",
  PD: "사용자의 니즈를 반영한 최상의 UI/UX를 만들어요. 여러 툴을 활용해 협업하며, 더 나은 사용자 경험을 고민해요.",
};

/**
 * 임시저장 응답 → 폼 값.
 *
 * 기본 정보는 고정 키로 저장되고, 지원서 답변은 파트 질문의 `key` 로 저장된다.
 * 답변은 현재 파트의 질문 목록에 있는 키만 복원한다 — 파트를 바꿔 질문이 달라졌을 때
 * 이전 파트의 답변이 섞여 들어가지 않게 하기 위함이다.
 */
function parseDraftToFormValues(
  draft: Record<string, unknown>,
  questions: ApplyQuestion[],
): Partial<FormValues> {
  const patch: Partial<FormValues> = {};
  if (typeof draft.email === "string") patch.email = draft.email;
  if (typeof draft.name === "string") patch.name = draft.name;
  if (typeof draft.phone === "string") patch.phone = draft.phone;
  if (typeof draft.birth === "string") patch.birth = draft.birth;
  if (typeof draft.region === "string") patch.region = draft.region;
  if ("agreedToPrivacy" in draft && typeof draft.agreedToPrivacy === "boolean") {
    patch.agreedToPrivacy = draft.agreedToPrivacy;
  }
  // `part` 는 복원하지 않는다. 임시저장은 cohortPartId 별로 조회하므로 방금 고른
  // 파트가 곧 정답이고, 저장본에 담긴 part 로 덮어쓰면 사용자가 막 선택한 파트가
  // 되돌아간다. (파트 A 에서 저장한 뒤 B 를 고르면 화면이 A 로 튀는 문제)

  // 첨부는 질문 유형이 file 인 것만 복원한다 — 질문이 서술형으로 바뀌었는데 예전
  // 첨부 객체가 남아 있으면 TextArea 에 객체가 들어가 렌더가 깨진다.
  const answers: Record<string, ApplyAnswer> = {};
  for (const question of questions) {
    const saved = draft[question.key];
    if (question.type === "file") {
      if (isApplicationAttachment(saved)) answers[question.key] = saved;
      continue;
    }
    if (typeof saved === "string") answers[question.key] = saved;
  }
  if (Object.keys(answers).length > 0) patch.answers = answers;

  return patch;
}

/** 첨부 질문의 답변이면 첨부 객체를, 아니면 null 을 돌려준다. */
function attachmentOf(answer: ApplyAnswer | undefined): ApplicationAttachmentDto | null {
  return isApplicationAttachment(answer) ? answer : null;
}

/** 서술형 질문의 답변 문자열. 첨부 객체가 들어와 있으면 빈 문자열로 본다. */
function textOf(answer: ApplyAnswer | undefined): string {
  return typeof answer === "string" ? answer : "";
}

/**
 * 미입력 필수 질문 1건을 찾는다.
 *
 * BE 검증 규칙과 동일하게 빈 문자열·공백만 있는 값은 미입력으로 본다.
 * 첨부 질문은 `path` 가 비어 있으면 서버가 400 으로 되돌려주므로 같은 기준을 쓴다.
 */
function findMissingRequiredAnswer(
  questions: ApplyQuestion[],
  answers: Record<string, ApplyAnswer>,
): ApplyQuestion | null {
  return (
    questions.find((q) => {
      if (!q.required) return false;
      const answer = answers[q.key];
      if (q.type === "file") return !attachmentOf(answer)?.path.trim();
      return !textOf(answer).trim();
    }) ?? null
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

const BANNER_TEXT = "함께 성장할 PM, 디자이너, 개발자를 기다리고 있어요.";

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  birth: "",
  region: "",
  agreedToPrivacy: false,
  part: null,
  answers: {},
};

const PageSection = styled.section({
  background: colors.background,
  color: colors.textInverse,
});

const Banner = styled.section({
  minHeight: "400px",
  padding: "160px 80px",
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#02111f",
  // 앞 레이어에 불투명 linear-gradient 가 깔려 있어서, url() 이 살아 있었더라도
  // 이미지(우측 3D "D" 오브젝트 포함)는 통째로 가려졌다. 원본 래스터만 쓴다.
  backgroundImage: `url('${assets.bannerBg}')`,
  backgroundSize: "cover",
  // 배너 폭이 이미지 비율(1920x360)보다 좁아지면 cover 가 좌우를 잘라낸다. center 로 두면
  // 오른쪽 끝의 3D "D" 오브젝트가 반쯤 잘리므로 오른쪽을 기준으로 붙인다.
  // 좁은 화면에서는 D 가 화면을 다 차지해 제목과 겹쳐서, 그때만 center 로 되돌린다.
  backgroundPosition: "right center",
  "@media (max-width: 1024px)": { padding: "160px 80px 80px" },
  "@media (max-width: 768px)": { padding: "140px 40px 50px", backgroundPosition: "center" },
  "@media (max-width: 767px)": { padding: "160px 16px 20px" },
});

const BannerInner = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxWidth: "1280px",
  margin: "0 auto",
});

const BannerLabel = styled.p({
  margin: 0,
  color: "#62748e",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "12px", lineHeight: "15px" },
});

const BannerTitle = styled.h1({
  margin: "8px 0 0",
  color: colors.slate300,
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 767px)": { fontSize: "24px", lineHeight: "30px", width: "265px" },
});

const ContainerPadding = styled.div({
  padding: "80px",
  "@media (max-width: 768px)": {
    padding: "16px 40px",
  },
  "@media (max-width: 767px)": {
    padding: "16px 16px",
  },
});

const Container = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
});

const FormTitle = styled.h2({
  margin: 0,
  textAlign: "center",
  color: colors.primary,
  fontSize: "clamp(28px, calc(1.85vw + 21.07px), 48px)",
  lineHeight: "clamp(38px, calc(1.85vw + 31.07px), 55px)",
  fontWeight: fontWeights.bold,
});

const FormDescription = styled.p({
  margin: "10px 0 0",
  textAlign: "center",
  color: "#d4d4d4",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const StepWrap = styled.div({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "20px",
  marginTop: "50px",
  paddingTop: "10px",
  "@media (max-width: 768px)": { gap: "12px", marginTop: "36px" },
  "@media (max-width: 767px)": { gap: "8px", marginTop: "28px" },
});

const StepLine = styled.div({
  position: "absolute",
  left: "calc(16.667% + 20px)",
  right: "calc(16.667% + 20px)",
  top: "50px",
  height: "2px",
  background: "#62748e",
  "@media (max-width: 768px)": {
    top: "40px",
    left: "calc(16.667% + 16px)",
    right: "calc(16.667% + 16px)",
  },
  "@media (max-width: 767px)": {
    top: "34px",
    left: "calc(16.667% + 12px)",
    right: "calc(16.667% + 12px)",
  },
});

const StepItem = styled.div({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  textAlign: "center",
});

const StepCircle = styled.div<{ active: boolean }>(({ active }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "999px",
  border: `2px solid ${active ? "#ffffff" : "#62748e"}`,
  background: colors.backgroundDark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  color: active ? "#ffffff" : "#62748e",
  "@media (max-width: 768px)": {
    width: "64px",
    height: "64px",
    fontSize: "28px",
    lineHeight: "36px",
  },
  "@media (max-width: 767px)": {
    width: "48px",
    height: "48px",
    fontSize: "20px",
    lineHeight: "24px",
  },
}));

const StepLabel = styled.p<{ active: boolean }>(({ active }) => ({
  margin: 0,
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,
  color: active ? "#ffffff" : "#62748e",
  "@media (max-width: 768px)": { fontSize: "18px", lineHeight: "24px" },
  "@media (max-width: 767px)": { fontSize: "12px", lineHeight: "16px" },
}));

const Card = styled.section({
  marginTop: "56px",
  borderRadius: "30px",
  background: colors.backgroundDark,
  padding: "80px",
  "@media (max-width: 1024px)": { padding: "56px 44px" },
  "@media (max-width: 768px)": { padding: "40px 24px" },
  "@media (max-width: 767px)": { marginTop: "28px", padding: "24px 16px", borderRadius: "20px" },
});

const CardTitle = styled.h3({
  margin: 0,
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const Fields = styled.div({
  maxWidth: "640px",
  margin: "40px auto 0",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  "@media (max-width: 767px)": { marginTop: "24px", gap: "14px" },
});

const Field = styled.label({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const Label = styled.span({
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const Required = styled.span<{ hasError?: boolean }>(({ hasError }) => ({
  color: hasError ? "#ff7d7d" : colors.primary,
}));

const Hint = styled.span({
  fontSize: "14px",
  lineHeight: "18px",
  color: "#d4d4d4",
  fontWeight: fontWeights.regular,
});

const Input = styled.input<{ hasError?: boolean; isFocused?: boolean; hasValue?: boolean }>(
  ({ hasError, isFocused, hasValue }) => ({
    width: "100%",
    height: "54px",
    borderRadius: "10px",
    border: "2px solid",
    borderColor: hasError
      ? "#ff7d7d"
      : isFocused
        ? colors.primary
        : hasValue
          ? "#d9e2ef"
          : "#ffffff",
    background: "#ffffff",
    color: colors.textPrimary,
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: fontWeights.medium,
    padding: "0 16px",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    boxShadow: isFocused ? "0 0 0 3px rgba(46, 113, 255, 0.15)" : "none",
    "&::placeholder": { color: colors.slate500 },
    "&:focus": {
      borderColor: hasError ? "#ff7d7d" : colors.primary,
      boxShadow: hasError
        ? "0 0 0 3px rgba(255, 125, 125, 0.15)"
        : "0 0 0 3px rgba(46, 113, 255, 0.15)",
    },
    "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px", height: "48px" },
  }),
);

const TextArea = styled.textarea({
  width: "100%",
  minHeight: "400px",
  borderRadius: "10px",
  border: "none",
  background: "#ffffff",
  color: colors.textPrimary,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  padding: "20px",
  resize: "vertical",
  "&::placeholder": { color: colors.textSecondary },
  "@media (max-width: 767px)": { minHeight: "280px", fontSize: "16px", lineHeight: "24px" },
});

const FileDropLabel = styled.label<{ disabled?: boolean }>(({ disabled }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  width: "100%",
  minHeight: "140px",
  borderRadius: "10px",
  border: "2px dashed #d9e2ef",
  background: "#ffffff",
  color: colors.textSecondary,
  padding: "20px",
  textAlign: "center" as const,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.6 : 1,
  pointerEvents: disabled ? ("none" as const) : ("auto" as const),
  transition: "border-color 0.15s ease",
  "&:hover": { borderColor: colors.primary },
}));

const FileDropTitle = styled.span({
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  color: colors.textPrimary,
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "24px" },
});

const FileCard = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  width: "100%",
  borderRadius: "10px",
  background: "#ffffff",
  padding: "20px",
  "@media (max-width: 767px)": { padding: "14px", gap: "8px" },
});

const FileName = styled.p({
  margin: 0,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  color: colors.textPrimary,
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "24px" },
});

const FileMeta = styled.p({
  margin: 0,
  fontSize: "14px",
  lineHeight: "18px",
  color: colors.textSecondary,
});

const FileAction = styled.button({
  flexShrink: 0,
  border: "none",
  background: "transparent",
  color: colors.primary,
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.semiBold,
  cursor: "pointer",
  padding: "6px 4px",
  "&:disabled": { color: colors.slate500, cursor: "default" },
});

const PrivacyBox = styled.div({
  marginTop: "24px",
  borderRadius: "10px",
  background: colors.slate300,
  color: colors.slate500,
  padding: "20px",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  whiteSpace: "pre-line",
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "24px" },
  "@media (max-width: 767px)": {
    marginTop: "16px",
    fontSize: "12px",
    lineHeight: "18px",
    padding: "14px",
  },
});

const Agreement = styled.button<{ checked: boolean }>(({ checked: _checked }) => ({
  marginTop: "16px",
  border: "none",
  background: "transparent",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  gap: "9px",
  minHeight: "20px",
  cursor: "pointer",
  padding: 0,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.semiBold,
  textAlign: "left" as const,
  "@media (max-width: 767px)": {
    marginTop: "12px",
    fontSize: "12px",
    lineHeight: "16px",
    gap: "7px",
  },
}));

const AgreementCheck = styled.span<{ checked: boolean }>(({ checked }) => ({
  width: "20px",
  height: "20px",
  borderRadius: "3px",
  border: checked ? "1px solid #2e71ff" : "1px solid #ffffff",
  background: checked ? colors.primary : "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const AgreementCheckIcon = styled.svg<{ visible: boolean }>(({ visible }) => ({
  display: "block",
  width: "11px",
  height: "8px",
  flexShrink: 0,
  opacity: visible ? 1 : 0,
}));

const AgreementText = styled.span({
  color: "#ffffff",
  display: "inline-block",
  whiteSpace: "nowrap",
});

const AgreementRequiredDot = styled.span({
  width: "7px",
  height: "7px",
  borderRadius: "999px",
  background: colors.primary,
  display: "inline-block",
  marginLeft: "0px",
  transform: "translateY(0px)",
  "@media (max-width: 767px)": {
    width: "4px",
    height: "4px",
  },
});

const ChipGrid = styled.div({
  marginTop: "20px",
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  "@media (max-width: 767px)": { gap: "10px" },
});

const Chip = styled.button<{ selected: boolean }>(({ selected }) => ({
  border: "none",
  borderRadius: "20px",
  background: selected ? colors.primary : colors.slate300,
  color: selected ? "#ffffff" : "#62748e",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  padding: "20px 40px",
  cursor: "pointer",
  "@media (max-width: 1024px)": { fontSize: "22px", lineHeight: "28px", padding: "16px 26px" },
  "@media (max-width: 768px)": { fontSize: "18px", lineHeight: "24px", padding: "12px 20px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px", padding: "10px 14px" },
}));

/** 파트마다 설명이 1~2줄로 갈려 선택할 때 카드 높이가 흔들리므로 2줄 높이를 미리 확보한다. */
const PartDescription = styled.p({
  margin: "20px 0 0",
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "30px",
  minHeight: "60px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "20px", lineHeight: "26px", minHeight: "52px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "22px", minHeight: "44px" },
  "@media (max-width: 767px)": {
    marginTop: "14px",
    fontSize: "12px",
    lineHeight: "18px",
    minHeight: "36px",
  },
});

const AnswerHeader = styled.div({
  background: colors.backgroundDark,
  borderRadius: "30px 30px 0 0",
  padding: "40px 80px",
  "@media (max-width: 768px)": { padding: "24px 20px" },
});

const AnswerBody = styled.div({
  background: colors.slate200,
  borderRadius: "0 0 30px 30px",
  padding: "40px 80px",
  "@media (max-width: 768px)": { padding: "20px" },
});

const ButtonRow = styled.div({
  marginTop: "56px",
  display: "flex",
  gap: "20px",
  "@media (max-width: 768px)": { marginTop: "40px" },
  "@media (max-width: 767px)": { marginTop: "28px", flexDirection: "column" },
});

const ActionButton = styled.button<{ primary?: boolean; full?: boolean }>(({ primary, full }) => ({
  border: "none",
  height: "80px",
  borderRadius: "100px",
  padding: "20px 50px",
  minWidth: full ? undefined : "200px",
  width: full ? "100%" : "auto",
  background: primary ? colors.primary : "#62748e",
  color: "#ffffff",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  "@media (max-width: 768px)": { height: "68px", fontSize: "18px", minWidth: "160px" },
  "@media (max-width: 767px)": { height: "52px", width: "100%", fontSize: "16px", minWidth: 0 },
}));

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d={
        back
          ? "M7.99676 14.5858L16.6034 5.97919L18.0176 7.3934L9.41097 16H16.9968V18H5.99676V7H7.99676V14.5858Z"
          : "M16.0032 9.41421L7.39663 18.0208L5.98242 16.6066L14.589 8H7.00324V6H18.0032V17H16.0032V9.41421Z"
      }
      fill="white"
    />
  </svg>
);

const SuccessWrap = styled.div({
  padding: "72px 0 40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  "@media (max-width: 767px)": { paddingTop: "20px", gap: "24px" },
});

const SuccessTitle = styled.h3({
  margin: 0,
  fontSize: "64px",
  lineHeight: "75px",
  fontWeight: fontWeights.bold,
  marginBottom: "20px",
  marginTop: "40px",
  "@media (max-width: 768px)": { fontSize: "44px", lineHeight: "54px" },
  "@media (max-width: 767px)": { fontSize: "32px", lineHeight: "40px" },
});

const ErrorText = styled.p({
  margin: "10px 0 0",
  color: "#ff7d7d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const ConfigErrorWrap = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  marginTop: "16px",
});

const RetryButton = styled.button({
  padding: "8px 20px",
  borderRadius: "999px",
  border: "1px solid #62748e",
  background: "transparent",
  color: colors.slate300,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",
  "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
});

const FieldError = styled.p({
  margin: "6px 0 0",
  color: "#ff7d7d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const InlineRow = styled.div({
  display: "flex",
  gap: "8px",
  alignItems: "flex-start",
  "@media (max-width: 767px)": { flexDirection: "column" },
});

const InlineInputWrap = styled.div({
  flex: 1,
  minWidth: 0,
});

const VerifyButton = styled.button({
  flexShrink: 0,
  height: "54px",
  padding: "0 20px",
  borderRadius: "10px",
  border: "none",
  background: colors.primary,
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.medium,
  whiteSpace: "nowrap",
  cursor: "pointer",
  "&:disabled": { background: colors.disabled, cursor: "not-allowed" },
  "@media (max-width: 767px)": { width: "100%", height: "48px", fontSize: "15px" },
});

const VerifiedRow = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  flexWrap: "wrap",
});

const VerifiedBadge = styled.p({
  margin: "6px 0 0",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: "#4ade80",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const ResetVerifiedButton = styled.button({
  flexShrink: 0,
  margin: "6px 0 0",
  padding: 0,
  border: "none",
  background: "transparent",
  color: colors.slate300,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  textDecoration: "underline",
  cursor: "pointer",
});

const SavedNotice = styled.p({
  margin: "10px 0 0",
  color: "#4ade80",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const VerifyNotice = styled.p({
  margin: "6px 0 0",
  color: colors.slate300,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.regular,
});

const CodeLabelRow = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
});

const CodeTimer = styled.span({
  color: "#ff7d7d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  fontVariantNumeric: "tabular-nums",
});

/** 인증번호 남은 시간 표시 (mm:ss) */
function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * 인증 완료 이메일을 브라우저에 남겨 재방문 시 인증 단계를 건너뛴다.
 *
 * `access_token` 은 httpOnly 쿠키(30일)라 JS 로 살아있는지 확인할 방법이 없다.
 * 그래서 이 값은 "직전에 인증했다" 는 힌트일 뿐이고, 쿠키가 먼저 만료되면 실제
 * 요청이 401 로 떨어진다 — 그때 이 값을 지우고 재인증을 유도한다.
 *
 * 힌트에도 쿠키와 같은 수명을 준다. localStorage 는 만료가 없어서 인증 시각을
 * 함께 남기지 않으면 쿠키가 죽은 지 한참 지난 방문에도 "인증 완료" 가 떠 있다가,
 * 2단계에서 임시저장을 불러올 때에야 401 로 튕긴다.
 */
const VERIFIED_EMAIL_STORAGE_KEY = "ddd.apply.verifiedEmail";
const VERIFIED_EMAIL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredVerifiedEmail = { email: string; verifiedAt: number };

function parseStoredVerifiedEmail(raw: string): StoredVerifiedEmail | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { email, verifiedAt } = parsed as Partial<StoredVerifiedEmail>;
    if (typeof email !== "string" || !email) return null;
    if (typeof verifiedAt !== "number" || !Number.isFinite(verifiedAt)) return null;
    return { email, verifiedAt };
  } catch {
    // 시각 없이 이메일만 넣던 예전 형식 — 언제 인증했는지 알 수 없어 버린다.
    return null;
  }
}

function readStoredVerifiedEmail(): string | null {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(VERIFIED_EMAIL_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  const stored = parseStoredVerifiedEmail(raw);
  if (!stored || Date.now() - stored.verifiedAt >= VERIFIED_EMAIL_TTL_MS) {
    writeStoredVerifiedEmail(null);
    return null;
  }
  return stored.email;
}

function writeStoredVerifiedEmail(email: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (email) {
      const stored: StoredVerifiedEmail = { email, verifiedAt: Date.now() };
      window.localStorage.setItem(VERIFIED_EMAIL_STORAGE_KEY, JSON.stringify(stored));
    } else {
      window.localStorage.removeItem(VERIFIED_EMAIL_STORAGE_KEY);
    }
  } catch {
    // 시크릿 모드 등 저장이 막힌 환경 — 인증 자체는 쿠키로 동작하므로 무시한다.
  }
}

const BIRTH_MIN_YEAR = 1900;

/**
 * 부트스트랩 실패 사유를 구분한다.
 *
 * fetch 는 네트워크 단절·CORS 차단 시 응답 없이 TypeError 로 reject 하므로,
 * 서버가 내려준 에러(ApiError)와 애초에 서버에 닿지 못한 경우를 나눠 안내한다.
 */
const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) {
    return "서버에 연결하지 못했어요. 네트워크 상태를 확인한 뒤 다시 시도해주세요.";
  }
  return fallback;
};

const resolveBootstrapErrorMessage = (error: unknown): string =>
  resolveErrorMessage(error, "모집 파트 정보를 불러오지 못했어요. 다시 시도해주세요.");

const BASIC_FIELD_FORMATTERS: Partial<Record<BasicField, (value: string) => string>> = {
  phone: formatPhoneInput,
  birth: formatBirthInput,
};

const validateBasicField = (field: BasicField, value: string) => {
  const trimmed = value.trim();

  if (field === "name") {
    if (!trimmed) return "이름을 입력해주세요.";
    if (!/^[가-힣a-zA-Z\s]{2,20}$/.test(trimmed)) {
      return "이름은 2~20자의 한글/영문으로 입력해주세요.";
    }
    return null;
  }

  if (field === "email") {
    if (!trimmed) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "올바른 이메일 형식을 입력해주세요.";
    return null;
  }

  if (field === "phone") {
    if (!trimmed) return "휴대폰 번호를 입력해주세요.";
    const digits = trimmed.replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) return "올바른 휴대폰 번호를 입력해주세요.";
    return null;
  }

  if (field === "region") {
    if (!trimmed) return "거주지역을 입력해주세요.";
    return null;
  }

  if (!trimmed) return "생년월일을 입력해주세요.";

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 8) return "생년월일은 YYYY / MM / DD 형식으로 입력해주세요.";

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isRealDate) return "유효한 생년월일을 입력해주세요.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() > today.getTime()) return "생년월일은 오늘 이전 날짜로 입력해주세요.";
  if (year < BIRTH_MIN_YEAR) return "생년월일을 다시 확인해주세요.";

  return null;
};

type AttachmentFieldProps = {
  question: ApplyQuestion;
  attachment: ApplicationAttachmentDto | null;
  isUploading: boolean;
  error: string | null;
  onSelect: (file: File) => void;
  onOpen: (path: string) => void;
  onRemove: () => void;
};

/**
 * PDF 첨부 질문의 입력 UI.
 *
 * 파일을 고르면 즉시 업로드되고, 화면에는 `originalName` 을 보여준다. 열람은 서명
 * URL 을 그때그때 발급받아 새 탭으로 연다(10분 만료라 미리 받아둘 수 없다).
 */
function AttachmentField({
  question,
  attachment,
  isUploading,
  error,
  onSelect,
  onOpen,
  onRemove,
}: AttachmentFieldProps) {
  return (
    <div>
      {attachment ? (
        <FileCard>
          <div style={{ minWidth: 0 }}>
            <FileName title={attachment.originalName}>{attachment.originalName}</FileName>
            <FileMeta>PDF · {formatBytes(attachment.size)}</FileMeta>
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <FileAction type="button" onClick={() => onOpen(attachment.path)}>
              열기
            </FileAction>
            <FileAction type="button" onClick={onRemove}>
              삭제
            </FileAction>
          </div>
        </FileCard>
      ) : (
        <FileDropLabel disabled={isUploading}>
          <input
            type="file"
            accept="application/pdf,.pdf"
            style={{ display: "none" }}
            disabled={isUploading}
            aria-label={question.label}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelect(file);
              event.target.value = ""; // 같은 파일 재선택 허용
            }}
          />
          <FileDropTitle>
            {isUploading ? "업로드 중이에요..." : "클릭해서 PDF 파일을 첨부해주세요"}
          </FileDropTitle>
          <Hint>PDF 형식 · 최대 20MB</Hint>
        </FileDropLabel>
      )}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

export const RecruitApplySection = () => {
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [basicErrors, setBasicErrors] = useState<Partial<Record<BasicField, string>>>({});
  const [basicTouched, setBasicTouched] = useState<Partial<Record<BasicField, boolean>>>({});
  const [focusedField, setFocusedField] = useState<BasicField | null>(null);
  const [applyParts, setApplyParts] = useState<ApplyPart[]>([]);
  const [questions, setQuestions] = useState<ApplyQuestion[]>([]);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  // 첨부 질문별 업로드 상태 — 키는 질문의 `key`
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  // 이메일 인증 — 인증을 마쳐야 임시저장·첨부·제출이 모두 동작한다.
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  // 인증이 끊겨 1단계로 되돌린 경우, 재인증 후 돌아갈 단계
  const [resumeStep, setResumeStep] = useState<Step | null>(null);
  // 질문·임시저장 로딩 effect 를 다시 태우는 토큰
  const [reloadToken, setReloadToken] = useState(0);

  const stepLabels = useMemo(() => ["기본 정보", "지원 파트", "지원서"], []);

  // 업로드가 끝나기 전에 제출하면 answers 에 첨부가 빠진 채로 나간다.
  const isUploadingAttachment = Object.values(uploadingKeys).some(Boolean);

  // 인증은 이메일 단위다 — 인증 후 주소를 고치면 그 인증은 더 이상 유효하지 않다.
  const normalizedEmail = values.email.trim().toLowerCase();
  const isEmailVerified = verifiedEmail !== null && verifiedEmail === normalizedEmail;
  const isCodeExpired = isCodeSent && codeExpiresIn <= 0;

  // 재방문 시 인증을 반복시키지 않으려고 직전 인증 이메일을 복원한다. (쿠키 30일)
  useEffect(() => {
    const stored = readStoredVerifiedEmail();
    if (!stored) return;
    setVerifiedEmail(stored);
    setValues((prev) => (prev.email ? prev : { ...prev, email: stored }));
  }, []);

  const isCountdownRunning = codeExpiresIn > 0 || resendCooldown > 0;
  useEffect(() => {
    if (!isCountdownRunning) return;
    const timer = window.setInterval(() => {
      setCodeExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isCountdownRunning]);

  const resetVerificationCode = () => {
    setIsCodeSent(false);
    setCode("");
    setCodeExpiresIn(0);
    setResendCooldown(0);
    setVerifyError(null);
    setVerifyNotice(null);
  };

  /**
   * 인증 힌트를 버리고 지원서를 빈 상태로 되돌린다.
   *
   * 공용 브라우저에서는 앞사람의 주소가 프리필된 채 "인증 완료" 로 보이고, 파트를
   * 고르면 앞사람의 임시저장까지 그대로 열린다. 사용자가 직접 끊을 수단이 필요하다.
   * 쿠키는 httpOnly 라 JS 로 못 지우지만, 인증 게이트가 임시저장·첨부·제출을 모두
   * 막고 있어 다음 사람이 인증을 마치는 순간 서버가 새 쿠키로 덮어쓴다.
   */
  const handleResetVerifiedEmail = () => {
    setVerifiedEmail(null);
    writeStoredVerifiedEmail(null);
    setValues(initialValues);
    setBasicErrors({});
    setBasicTouched({});
    setUploadingKeys({});
    setUploadErrors({});
    setQuestions([]);
    setQuestionsError(null);
    setDraftNotice(null);
    setResumeStep(null);
    setError(null);
    setStep(1);
    resetVerificationCode();
  };

  /**
   * 인증 쿠키가 끊긴 상태(401)를 처리한다.
   *
   * 만료는 예고 없이 오므로 작성 중이던 단계를 기억해뒀다가 재인증 후 되돌린다.
   * 입력값은 `values` 에 그대로 남아 있어 다시 작성할 필요가 없다.
   */
  const handleUnauthorized = useCallback((interruptedStep: Step) => {
    setVerifiedEmail(null);
    writeStoredVerifiedEmail(null);
    setIsCodeSent(false);
    setCode("");
    setCodeExpiresIn(0);
    setResendCooldown(0);
    setVerifyError(null);
    setVerifyNotice(null);
    setResumeStep(interruptedStep);
    setStep(1);
    setError(
      "이메일 인증이 만료되었어요. 다시 인증하면 작성하던 내용 그대로 이어서 진행할 수 있어요.",
    );
  }, []);

  const handleRequestCode = async () => {
    const emailError = validateBasicField("email", values.email);
    setBasicTouched((prev) => ({ ...prev, email: true }));
    setBasicErrors((prev) => ({ ...prev, email: emailError ?? "" }));
    if (emailError) return;

    setVerifyError(null);
    setVerifyNotice(null);
    setIsRequestingCode(true);
    try {
      await requestApplicationEmailVerification(normalizedEmail);
      setIsCodeSent(true);
      setCode("");
      setCodeExpiresIn(APPLICATION_VERIFICATION_CODE_TTL_SECONDS);
      setResendCooldown(APPLICATION_VERIFICATION_RESEND_COOLDOWN_SECONDS);
      setVerifyNotice(`${normalizedEmail} 으로 인증번호를 보냈어요. 메일함을 확인해주세요.`);
    } catch (e) {
      // 쿨다운은 서버가 판단한다 — 429 를 받으면 남은 시간만큼 버튼을 잠가 헛요청을 막는다.
      if (e instanceof ApiError && e.code === "VERIFICATION_COOLDOWN") {
        setResendCooldown(APPLICATION_VERIFICATION_RESEND_COOLDOWN_SECONDS);
      }
      setVerifyError(
        resolveErrorMessage(e, "인증번호를 보내지 못했어요. 잠시 후 다시 시도해주세요."),
      );
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!APPLICATION_VERIFICATION_CODE_PATTERN.test(code)) {
      setVerifyError("인증번호 6자리를 입력해주세요.");
      return;
    }
    setVerifyError(null);
    setIsConfirmingCode(true);
    try {
      await confirmApplicationEmailVerification(normalizedEmail, code);
      setVerifiedEmail(normalizedEmail);
      writeStoredVerifiedEmail(normalizedEmail);
      resetVerificationCode();
      setError(null);
      // 인증 만료로 되돌아온 경우라면 끊긴 지점으로 복귀시킨다.
      if (resumeStep !== null) {
        setStep(resumeStep);
        setResumeStep(null);
        // 2단계에서 끊겼다는 건 임시저장 조회가 401 로 실패했다는 뜻이라 다시 불러온다.
        // 3단계는 이미 화면에 답변이 들어와 있어 재조회하면 방금 쓴 내용을 저장본으로 덮는다.
        if (resumeStep === 2) setReloadToken((token) => token + 1);
      }
    } catch (e) {
      setVerifyError(resolveErrorMessage(e, "인증에 실패했어요. 잠시 후 다시 시도해주세요."));
    } finally {
      setIsConfirmingCode(false);
    }
  };

  const cohortPartIdByOption = useMemo(
    () => new Map(applyParts.map((part) => [part.option, part.cohortPartId])),
    [applyParts],
  );

  const loadApplyParts = useCallback(async () => {
    setIsBootstrapLoading(true);
    setConfigError(null);
    try {
      const parts = await fetchApplyParts();
      setApplyParts(parts);
      if (parts.length === 0) {
        setConfigError("현재 지원을 받고 있는 파트가 없어요. 모집 일정을 다시 확인해주세요.");
      }
    } catch (e) {
      setApplyParts([]);
      console.error("[recruit/apply] 모집 파트 조회 실패", e);
      setConfigError(resolveBootstrapErrorMessage(e));
    } finally {
      setIsBootstrapLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplyParts();
  }, [loadApplyParts]);

  // 선택해둔 파트가 모집 목록에서 빠지면(마감·설정 변경) 선택을 비워 제출 단계에서 막히지 않게 한다.
  useEffect(() => {
    if (isBootstrapLoading || !values.part) return;
    if (cohortPartIdByOption.has(values.part as ApplyPartOption)) return;
    setValues((prev) => ({ ...prev, part: null }));
  }, [isBootstrapLoading, values.part, cohortPartIdByOption]);

  const selectedCohortPartId = values.part
    ? (cohortPartIdByOption.get(values.part as ApplyPartOption) ?? null)
    : null;

  /**
   * 파트를 고르면 그 파트의 지원서 질문과 임시저장을 함께 불러온다.
   *
   * 질문 목록은 제출 계약 그 자체다 — answers 의 키가 여기서 온 `key` 와 다르면
   * 400 INVALID_APPLICATION_ANSWERS 가 나므로, 질문을 못 받으면 3단계를 열지 않는다.
   */
  useEffect(() => {
    // 파트가 바뀌면 질문 목록이 통째로 갈리므로 이전 파트의 업로드 상태도 버린다.
    setUploadingKeys({});
    setUploadErrors({});
    // 이전 파트의 질문도 즉시 버린다. 남겨두면 새 질문이 도착하기 전까지 3단계가
    // 이전 파트 질문을 그대로 보여주고, 그 사이 제출하면 cohortPartId 는 새 파트인데
    // answers 키는 이전 파트 것이라 400 INVALID_APPLICATION_ANSWERS 가 난다.
    setQuestions([]);
    setQuestionsError(null);

    if (selectedCohortPartId === null) return;

    let cancelled = false;
    (async () => {
      setIsLoadingQuestions(true);
      setQuestionsError(null);
      try {
        const loaded = await fetchApplyQuestions(selectedCohortPartId);
        if (cancelled) return;
        setQuestions(loaded);
        if (loaded.length === 0) {
          setQuestionsError("이 파트의 지원서 양식이 아직 등록되지 않았어요.");
          return;
        }

        setIsLoadingDraft(true);
        try {
          const draft = await fetchApplicationDraftAnswers(selectedCohortPartId);
          if (cancelled || !draft) return;
          const patch = parseDraftToFormValues(draft, loaded);
          setValues((prev) => ({ ...prev, ...patch }));
        } catch (e) {
          if (cancelled) return;
          // 저장된 지원서가 없는 경우(404)는 여기까지 오지 않는다 — 남는 건 인증 만료뿐이다.
          if (isUnauthorizedError(e)) handleUnauthorized(2);
        } finally {
          if (!cancelled) setIsLoadingDraft(false);
        }
      } catch (e) {
        if (cancelled) return;
        setQuestions([]);
        setQuestionsError(
          e instanceof ApiError ? e.message : "지원서 양식을 불러오지 못했어요. 다시 시도해주세요.",
        );
      } finally {
        if (!cancelled) setIsLoadingQuestions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCohortPartId, handleUnauthorized, reloadToken]);

  /**
   * 제출·임시저장에 쓰는 answers.
   *
   * 키는 반드시 질문의 `key` 여야 한다. 어드민에서 key 는 편집할 수 없고 label 을
   * slugify 한 값이 자동 저장되므로(한글 라벨 → 한글 key) 프론트가 임의로 만들면 안 된다.
   *
   * 첨부 질문은 업로드 응답 객체를 그대로 싣는다. 아직 올리지 않았으면 키를 아예
   * 빼는데, 빈 문자열을 넣으면 서버가 미응답이 아니라 잘못된 경로로 볼 여지가 있고
   * 선택 첨부에서는 굳이 보낼 값이 없기 때문이다.
   */
  const buildAnswers = useCallback((): Record<string, unknown> => {
    const entries: Array<[string, unknown]> = [];
    for (const question of questions) {
      const answer = values.answers[question.key];
      if (question.type === "file") {
        const attachment = attachmentOf(answer);
        if (attachment) entries.push([question.key, attachment]);
        continue;
      }
      entries.push([question.key, textOf(answer)]);
    }
    return Object.fromEntries(entries);
  }, [questions, values.answers]);

  const validateCurrentStep = () => {
    if (step === 1) {
      const nextBasicErrors: Partial<Record<BasicField, string>> = {};
      const nameError = validateBasicField("name", values.name);
      const emailError = validateBasicField("email", values.email);
      const phoneError = validateBasicField("phone", values.phone);
      const birthError = validateBasicField("birth", values.birth);
      const regionError = validateBasicField("region", values.region);
      if (nameError) nextBasicErrors.name = nameError;
      if (emailError) nextBasicErrors.email = emailError;
      if (phoneError) nextBasicErrors.phone = phoneError;
      if (birthError) nextBasicErrors.birth = birthError;
      if (regionError) nextBasicErrors.region = regionError;
      setBasicErrors(nextBasicErrors);
      setBasicTouched((prev) => ({
        ...prev,
        name: true,
        email: true,
        phone: true,
        birth: true,
        region: true,
      }));

      if (nameError || emailError || phoneError || birthError || regionError) {
        setError("기본 정보를 다시 확인해주세요.");
        return false;
      }
      if (!isEmailVerified) {
        setError("이메일 인증을 완료해주세요.");
        return false;
      }
      if (!values.agreedToPrivacy) {
        setError("개인정보 수집 및 이용에 동의해주세요.");
        return false;
      }
    }

    if (step === 2 && !values.part) {
      setError("지원 파트를 선택해주세요.");
      return false;
    }

    if (step === 3) {
      const missing = findMissingRequiredAnswer(questions, values.answers);
      if (missing) {
        setError(`"${missing.label}" 항목을 입력해주세요.`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const validateAllStepsForSubmit = (): boolean => {
    const nextBasicErrors: Partial<Record<BasicField, string>> = {};
    const nameError = validateBasicField("name", values.name);
    const emailError = validateBasicField("email", values.email);
    const phoneError = validateBasicField("phone", values.phone);
    const birthError = validateBasicField("birth", values.birth);
    const regionError = validateBasicField("region", values.region);
    if (nameError) nextBasicErrors.name = nameError;
    if (emailError) nextBasicErrors.email = emailError;
    if (phoneError) nextBasicErrors.phone = phoneError;
    if (birthError) nextBasicErrors.birth = birthError;
    if (regionError) nextBasicErrors.region = regionError;
    setBasicErrors(nextBasicErrors);
    setBasicTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      phone: true,
      birth: true,
      region: true,
    }));

    if (nameError || emailError || phoneError || birthError || regionError) {
      setError("기본 정보를 다시 확인해주세요.");
      return false;
    }
    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.");
      setStep(1);
      return false;
    }
    if (!values.agreedToPrivacy) {
      setError("개인정보 수집 및 이용에 동의해주세요.");
      return false;
    }
    if (!values.part) {
      setError("지원 파트를 선택해주세요.");
      return false;
    }
    if (questions.length === 0) {
      setError("지원서 양식을 불러오지 못해 제출할 수 없어요.");
      return false;
    }
    const missing = findMissingRequiredAnswer(questions, values.answers);
    if (missing) {
      setError(`"${missing.label}" 항목을 입력해주세요.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSaveDraft = useCallback(async () => {
    if (!values.part) {
      setError("지원 파트를 선택한 뒤 임시저장할 수 있어요.");
      return;
    }
    if (selectedCohortPartId === null) {
      setError("선택한 파트의 모집 정보를 찾지 못했어요.");
      return;
    }
    if (!isEmailVerified) {
      setError("이메일 인증을 완료해야 임시저장할 수 있어요.");
      setStep(1);
      return;
    }
    setError(null);
    setDraftNotice(null);
    setIsSavingDraft(true);
    try {
      await saveRecruitApplicationDraft(selectedCohortPartId, {
        email: values.email,
        name: values.name,
        phone: formatApplicantPhoneKorea(values.phone),
        birth: values.birth,
        region: values.region,
        agreedToPrivacy: values.agreedToPrivacy,
        part: values.part,
        ...buildAnswers(),
      });
      setDraftNotice("작성 중인 지원서를 임시저장했어요.");
    } catch (e) {
      if (isUnauthorizedError(e)) {
        handleUnauthorized(step);
        return;
      }
      setError(resolveErrorMessage(e, "임시저장에 실패했어요. 잠시 후 다시 시도해주세요."));
    } finally {
      setIsSavingDraft(false);
    }
  }, [values, selectedCohortPartId, buildAnswers, isEmailVerified, step, handleUnauthorized]);

  const handleNext = async (event: FormEvent) => {
    event.preventDefault();
    setDraftNotice(null);
    if (isSubmitting || isBootstrapLoading) return;
    if (isUploadingAttachment) {
      setError("첨부 파일 업로드가 끝난 뒤에 진행할 수 있어요.");
      return;
    }
    if (!validateCurrentStep()) return;

    if (step === 3) {
      if (!validateAllStepsForSubmit()) return;
      if (selectedCohortPartId === null) {
        setError("지원 파트 정보를 불러오지 못해 제출할 수 없어요.");
        return;
      }
      const birthApi = birthInputToApiDate(values.birth);
      setIsSubmitting(true);
      setError(null);
      try {
        await submitRecruitApplication({
          cohortPartId: selectedCohortPartId,
          applicantName: values.name.trim(),
          applicantPhone: formatApplicantPhoneKorea(values.phone),
          applicantBirthDate: birthApi,
          applicantRegion: values.region.trim(),
          answers: buildAnswers(),
          privacyAgreed: values.agreedToPrivacy,
        });
        setStep(4);
      } catch (e) {
        if (isUnauthorizedError(e)) {
          handleUnauthorized(3);
          return;
        }
        setError(resolveErrorMessage(e, "제출에 실패했어요. 잠시 후 다시 시도해주세요."));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  };

  const handlePrev = () => {
    setError(null);
    setDraftNotice(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const handleAnswerChange = (key: string, value: string) => {
    setDraftNotice(null);
    setValues((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  };

  const setAttachment = (key: string, attachment: ApplicationAttachmentDto | null) => {
    setValues((prev) => {
      const nextAnswers = { ...prev.answers };
      if (attachment) {
        nextAnswers[key] = attachment;
      } else {
        delete nextAnswers[key];
      }
      return { ...prev, answers: nextAnswers };
    });
  };

  /**
   * 파일을 고르는 즉시 업로드해 `path` 를 받아둔다.
   *
   * 제출 시점에 한꺼번에 올리지 않는 이유는 BE 계약이 그렇기 때문이다 — answers 에는
   * 이미 업로드된 첨부의 path 만 실을 수 있다.
   */
  const handleAttachmentSelect = async (key: string, file: File) => {
    setUploadErrors((prev) => ({ ...prev, [key]: "" }));
    setUploadingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const attachment = await uploadApplicationAttachment(file);
      setAttachment(key, attachment);
    } catch (e) {
      if (isUnauthorizedError(e)) {
        handleUnauthorized(3);
        return;
      }
      setUploadErrors((prev) => ({
        ...prev,
        [key]: e instanceof ApiError ? e.message : "파일 업로드에 실패했어요.",
      }));
    } finally {
      setUploadingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAttachmentOpen = async (key: string, path: string) => {
    setUploadErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      await openApplicationAttachment(path);
    } catch (e) {
      if (isUnauthorizedError(e)) {
        handleUnauthorized(3);
        return;
      }
      setUploadErrors((prev) => ({
        ...prev,
        [key]: e instanceof ApiError ? e.message : "파일을 여는 데 실패했어요.",
      }));
    }
  };

  // 질문 로딩 effect 의 단일 재진입점.
  //
  // 예전에는 part 를 null 로 비웠다 되돌려 effect 를 다시 태웠는데, 두 setValues 가
  // 한 렌더에 배칭돼 part 가 결국 그대로라 effect 가 재실행되지 않았다(= 버튼 무반응).
  const reloadQuestions = () => setReloadToken((token) => token + 1);

  // 파트 목록이 비어 있으면 파트 선택 이후 단계는 진행할 수 없다(기본 정보 입력은 계속 가능).
  const partsUnavailable = applyParts.length === 0;
  const partTitle = values.part ? `${values.part} 파트 지원서` : "지원서";
  const handleBasicBlur = (field: BasicField) => {
    setFocusedField((prev) => (prev === field ? null : prev));
    setBasicTouched((prev) => ({ ...prev, [field]: true }));
    const nextError = validateBasicField(field, values[field]);
    setBasicErrors((prev) => ({ ...prev, [field]: nextError ?? "" }));
  };

  const handleBasicChange = (field: BasicField, rawValue: string) => {
    const value = BASIC_FIELD_FORMATTERS[field]?.(rawValue) ?? rawValue;
    setValues((prev) => ({ ...prev, [field]: value }));
    // 앞서 받은 인증번호는 이전 주소로 발송된 것이라 주소가 바뀌면 버린다.
    // (`verifiedEmail` 은 남겨둔다 — 주소를 되돌리면 그 인증이 그대로 유효하다.)
    if (field === "email") resetVerificationCode();
    if (!basicTouched[field]) return;
    const nextError = validateBasicField(field, value);
    setBasicErrors((prev) => ({ ...prev, [field]: nextError ?? "" }));
  };

  return (
    <PageSection>
      <Banner>
        <BannerInner>
          <BannerLabel>Recruitment</BannerLabel>
          <BannerTitle>{BANNER_TEXT}</BannerTitle>
        </BannerInner>
      </Banner>

      <ContainerPadding>
        <Container>
          {step < 4 ? (
            <>
              <FormTitle>DDD 지원서</FormTitle>
              <FormDescription>{BANNER_TEXT}</FormDescription>
              {configError ? (
                <ConfigErrorWrap>
                  <ErrorText style={{ textAlign: "center" }}>{configError}</ErrorText>
                  <RetryButton
                    type="button"
                    onClick={() => void loadApplyParts()}
                    disabled={isBootstrapLoading}
                  >
                    {isBootstrapLoading ? "불러오는 중..." : "다시 시도"}
                  </RetryButton>
                </ConfigErrorWrap>
              ) : null}
              {isBootstrapLoading ? (
                <p
                  style={{
                    marginTop: "12px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "16px",
                  }}
                >
                  모집 정보를 불러오는 중이에요...
                </p>
              ) : null}
              {isLoadingDraft && values.part ? (
                <p
                  style={{
                    marginTop: "8px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  저장된 임시 지원서를 불러오는 중이에요...
                </p>
              ) : null}
            </>
          ) : null}

          {step < 4 ? (
            <>
              <StepWrap>
                <StepLine />
                {stepLabels.map((label, index) => {
                  const current = index + 1;
                  const isActive = step === current;
                  return (
                    <StepItem key={label}>
                      <StepCircle active={isActive}>{current}</StepCircle>
                      <StepLabel active={isActive}>{label}</StepLabel>
                    </StepItem>
                  );
                })}
              </StepWrap>

              <form onSubmit={handleNext}>
                {step === 1 ? (
                  <>
                    <Card>
                      <CardTitle>기본 정보</CardTitle>
                      <Fields>
                        <Field>
                          <Label>
                            이름 <Required hasError={Boolean(basicErrors.name)}>*</Required>
                          </Label>
                          <Input
                            placeholder="홍길동"
                            value={values.name}
                            hasError={Boolean(basicErrors.name)}
                            isFocused={focusedField === "name"}
                            hasValue={Boolean(values.name.trim())}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => handleBasicBlur("name")}
                            onChange={(event) => handleBasicChange("name", event.target.value)}
                          />
                          {basicErrors.name ? <FieldError>{basicErrors.name}</FieldError> : null}
                        </Field>
                        <Field as="div">
                          <Label>
                            이메일 <Required hasError={Boolean(basicErrors.email)}>*</Required>
                          </Label>
                          <Hint>
                            합격 결과 안내 이메일이 발송됩니다. 지원서 임시저장·제출에 이메일 인증이
                            필요해요.
                          </Hint>
                          <InlineRow>
                            <InlineInputWrap>
                              <Input
                                placeholder="test@email.com"
                                type="email"
                                autoComplete="email"
                                aria-label="이메일"
                                value={values.email}
                                hasError={Boolean(basicErrors.email)}
                                isFocused={focusedField === "email"}
                                hasValue={Boolean(values.email.trim())}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => handleBasicBlur("email")}
                                onChange={(event) => handleBasicChange("email", event.target.value)}
                              />
                            </InlineInputWrap>
                            {isEmailVerified ? null : (
                              <VerifyButton
                                type="button"
                                onClick={() => void handleRequestCode()}
                                disabled={isRequestingCode || resendCooldown > 0}
                              >
                                {isRequestingCode
                                  ? "발송 중..."
                                  : resendCooldown > 0
                                    ? `재발송 ${resendCooldown}초`
                                    : isCodeSent
                                      ? "재발송"
                                      : "인증번호 받기"}
                              </VerifyButton>
                            )}
                          </InlineRow>
                          {basicErrors.email ? <FieldError>{basicErrors.email}</FieldError> : null}
                          {isEmailVerified ? (
                            <VerifiedRow>
                              <VerifiedBadge>✓ 이메일 인증이 완료되었어요.</VerifiedBadge>
                              <ResetVerifiedButton type="button" onClick={handleResetVerifiedEmail}>
                                다른 이메일로 지원하기
                              </ResetVerifiedButton>
                            </VerifiedRow>
                          ) : null}
                          {!isEmailVerified && verifyNotice ? (
                            <VerifyNotice>{verifyNotice}</VerifyNotice>
                          ) : null}
                        </Field>

                        {isCodeSent && !isEmailVerified ? (
                          <Field as="div">
                            <CodeLabelRow>
                              <Label>
                                인증번호 <Required hasError={Boolean(verifyError)}>*</Required>
                              </Label>
                              <CodeTimer>
                                {isCodeExpired
                                  ? "만료됨"
                                  : `${formatCountdown(codeExpiresIn)} 남음`}
                              </CodeTimer>
                            </CodeLabelRow>
                            <InlineRow>
                              <InlineInputWrap>
                                <Input
                                  placeholder="6자리 숫자"
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                  maxLength={6}
                                  aria-label="인증번호"
                                  value={code}
                                  hasError={Boolean(verifyError) || isCodeExpired}
                                  hasValue={Boolean(code)}
                                  onChange={(event) =>
                                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                                  }
                                />
                              </InlineInputWrap>
                              <VerifyButton
                                type="button"
                                onClick={() => void handleConfirmCode()}
                                disabled={isConfirmingCode || isCodeExpired}
                              >
                                {isConfirmingCode ? "확인 중..." : "확인"}
                              </VerifyButton>
                            </InlineRow>
                            {isCodeExpired ? (
                              <FieldError>
                                인증번호가 만료되었어요. 재발송 후 다시 입력해주세요.
                              </FieldError>
                            ) : null}
                          </Field>
                        ) : null}

                        {verifyError ? <FieldError>{verifyError}</FieldError> : null}
                        <Field>
                          <Label>
                            휴대폰 번호 <Required hasError={Boolean(basicErrors.phone)}>*</Required>
                          </Label>
                          <Input
                            placeholder="010-0000-0000"
                            inputMode="numeric"
                            autoComplete="tel"
                            value={values.phone}
                            hasError={Boolean(basicErrors.phone)}
                            isFocused={focusedField === "phone"}
                            hasValue={Boolean(values.phone.trim())}
                            onFocus={() => setFocusedField("phone")}
                            onBlur={() => handleBasicBlur("phone")}
                            onChange={(event) => handleBasicChange("phone", event.target.value)}
                          />
                          {basicErrors.phone ? <FieldError>{basicErrors.phone}</FieldError> : null}
                        </Field>
                        <Field>
                          <Label>
                            생년월일 <Required hasError={Boolean(basicErrors.birth)}>*</Required>
                          </Label>
                          <Input
                            placeholder="YYYY / MM / DD"
                            inputMode="numeric"
                            autoComplete="bday"
                            value={values.birth}
                            hasError={Boolean(basicErrors.birth)}
                            isFocused={focusedField === "birth"}
                            hasValue={Boolean(values.birth.trim())}
                            onFocus={() => setFocusedField("birth")}
                            onBlur={() => handleBasicBlur("birth")}
                            onChange={(event) => handleBasicChange("birth", event.target.value)}
                          />
                          {basicErrors.birth ? <FieldError>{basicErrors.birth}</FieldError> : null}
                        </Field>
                        <Field>
                          <Label>
                            거주지역 <Required hasError={Boolean(basicErrors.region)}>*</Required>
                          </Label>
                          <Input
                            placeholder="선택해주세요."
                            value={values.region}
                            hasError={Boolean(basicErrors.region)}
                            isFocused={focusedField === "region"}
                            hasValue={Boolean(values.region.trim())}
                            onFocus={() => setFocusedField("region")}
                            onBlur={() => handleBasicBlur("region")}
                            onChange={(event) => handleBasicChange("region", event.target.value)}
                          />
                          {basicErrors.region ? (
                            <FieldError>{basicErrors.region}</FieldError>
                          ) : null}
                        </Field>
                      </Fields>
                    </Card>

                    <Card style={{ minHeight: "420px" }}>
                      <CardTitle>개인정보 수집 및 이용 동의</CardTitle>
                      <PrivacyBox>
                        {`수집 항목: 이름, 이메일, 휴대폰 번호, 생년월일, 거주 지역, 지원 파트, 지원 내용
수집 목적: 지원자 심사 및 선발, 결과 안내, 활동 안내
보유 기간: 지원 결과 발표 후 6개월 보관 후 즉시 파기

위 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 미동의 시 지원이 불가합니다. 수집된 정보는 제3자에게 제공되지 않습니다.`}
                      </PrivacyBox>
                      <Agreement
                        type="button"
                        checked={values.agreedToPrivacy}
                        onClick={() =>
                          setValues((prev) => ({ ...prev, agreedToPrivacy: !prev.agreedToPrivacy }))
                        }
                      >
                        <AgreementCheck checked={values.agreedToPrivacy} aria-hidden>
                          <AgreementCheckIcon
                            visible={values.agreedToPrivacy}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 14 11"
                            fill="none"
                          >
                            <path
                              d="M1 5.5L5 9.5L13 1.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </AgreementCheckIcon>
                        </AgreementCheck>
                        <AgreementText>개인정보 수집 및 이용에 동의합니다</AgreementText>
                        <AgreementRequiredDot aria-hidden />
                      </Agreement>
                    </Card>
                  </>
                ) : null}

                {step === 2 ? (
                  <Card>
                    <CardTitle>지원 파트</CardTitle>
                    <Fields style={{ maxWidth: "100%", marginTop: "28px" }}>
                      <Label>
                        지원할 파트를 선택해주세요. <Required>*</Required>
                      </Label>
                      <ChipGrid>
                        {applyParts.map(({ option }) => (
                          <Chip
                            type="button"
                            key={option}
                            selected={values.part === option}
                            onClick={() => setValues((prev) => ({ ...prev, part: option }))}
                          >
                            {option}
                          </Chip>
                        ))}
                      </ChipGrid>
                      {values.part ? (
                        <PartDescription>
                          {PART_DESCRIPTIONS[values.part as ApplyPartOption]}
                        </PartDescription>
                      ) : null}
                    </Fields>
                  </Card>
                ) : null}

                {step === 3 ? (
                  <>
                    <h3
                      style={{
                        marginTop: 56,
                        marginBottom: 20,
                        fontSize: 24,
                        lineHeight: "30px",
                        fontWeight: 500,
                      }}
                    >
                      {partTitle}
                    </h3>

                    {isLoadingQuestions ? (
                      <AnswerBody>지원서 양식을 불러오는 중이에요...</AnswerBody>
                    ) : null}

                    {questionsError ? (
                      <ConfigErrorWrap>
                        <ErrorText style={{ textAlign: "center" }}>{questionsError}</ErrorText>
                        <RetryButton
                          type="button"
                          onClick={() => reloadQuestions()}
                          disabled={isLoadingQuestions}
                        >
                          {isLoadingQuestions ? "불러오는 중..." : "다시 시도"}
                        </RetryButton>
                      </ConfigErrorWrap>
                    ) : null}

                    {questions.map((question, index) => (
                      <div key={question.key} style={{ marginTop: index === 0 ? 0 : 20 }}>
                        <AnswerHeader>
                          <p
                            style={{
                              margin: 0,
                              color: colors.primary,
                              fontSize: 24,
                              lineHeight: "30px",
                              fontWeight: 500,
                            }}
                          >
                            {`Q${index + 1}`}
                          </p>
                          <p
                            style={{ margin: 0, fontSize: 24, lineHeight: "30px", fontWeight: 500 }}
                          >
                            {question.label} {question.required ? <Required>*</Required> : null}
                          </p>
                        </AnswerHeader>
                        <AnswerBody>
                          {question.type === "file" ? (
                            <AttachmentField
                              question={question}
                              attachment={attachmentOf(values.answers[question.key])}
                              isUploading={uploadingKeys[question.key] === true}
                              error={uploadErrors[question.key] || null}
                              onSelect={(file) => void handleAttachmentSelect(question.key, file)}
                              onOpen={(path) => void handleAttachmentOpen(question.key, path)}
                              onRemove={() => setAttachment(question.key, null)}
                            />
                          ) : (
                            <TextArea
                              placeholder="1,000자 이내로 입력해주세요."
                              value={textOf(values.answers[question.key])}
                              onChange={(event) =>
                                handleAnswerChange(question.key, event.target.value)
                              }
                            />
                          )}
                        </AnswerBody>
                      </div>
                    ))}
                  </>
                ) : null}

                {error ? <ErrorText>{error}</ErrorText> : null}
                {!error && draftNotice ? <SavedNotice>{draftNotice}</SavedNotice> : null}

                <ButtonRow>
                  {step > 1 ? (
                    <ActionButton
                      type="button"
                      onClick={handlePrev}
                      disabled={isSubmitting || isBootstrapLoading}
                    >
                      이전 <Arrow back />
                    </ActionButton>
                  ) : null}
                  {step >= 2 && step <= 3 && values.part ? (
                    <ActionButton
                      type="button"
                      onClick={() => void handleSaveDraft()}
                      disabled={
                        isSavingDraft ||
                        isSubmitting ||
                        isBootstrapLoading ||
                        isUploadingAttachment ||
                        partsUnavailable
                      }
                    >
                      {isSavingDraft ? "저장 중..." : "임시저장"}
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    type="submit"
                    primary
                    full={step !== 3}
                    disabled={
                      isSubmitting ||
                      isBootstrapLoading ||
                      isUploadingAttachment ||
                      (step >= 2 && partsUnavailable) ||
                      (step === 3 && (isLoadingQuestions || questions.length === 0))
                    }
                  >
                    {step === 3 ? (
                      isSubmitting ? (
                        "제출 중..."
                      ) : (
                        "제출하기"
                      )
                    ) : (
                      <>
                        다음 <Arrow />
                      </>
                    )}
                  </ActionButton>
                </ButtonRow>
              </form>
            </>
          ) : (
            <SuccessWrap>
              <img src={successIcon.src} alt="" width={180} height={180} />
              <div>
                <SuccessTitle>지원서가 제출됐어요.</SuccessTitle>
                <p
                  style={{
                    marginBottom: "160px",
                    fontSize: "28px",
                    lineHeight: "32px",
                    fontWeight: 600,
                    color: "#d4d4d4",
                  }}
                >
                  검토 후 입력하신 이메일로 결과를 안내드릴게요.
                  <br />
                  DDD와 함께할 날을 기대하고 있을게요 :)
                </p>
              </div>
              <ActionButton
                primary
                full
                onClick={() => {
                  setValues(initialValues);
                  setBasicErrors({});
                  setBasicTouched({});
                  setUploadingKeys({});
                  setUploadErrors({});
                  setError(null);
                  setStep(1);
                }}
              >
                완료
              </ActionButton>
            </SuccessWrap>
          )}
        </Container>
      </ContainerPadding>
    </PageSection>
  );
};
