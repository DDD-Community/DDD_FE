"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import successIcon from "@/public/images/success.png";

type Step = 1 | 2 | 3 | 4 | 5;
type BasicField = "name" | "email" | "phone" | "birth" | "region";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  birth: string;
  region: string;
  agreedToPrivacy: boolean;
  part: string | null;
  essay: string;
  portfolioLink: string;
  portfolioFile: File | null;
  channels: string[];
};

const PART_OPTIONS = ["iOS", "AOS", "FE", "BE", "PM", "PD"] as const;
const CHANNEL_OPTIONS = [
  "지인 추천",
  "인스타그램",
  "링크드인",
  "블로그",
  "아티클",
  "이전 기수 활동",
  "기타",
] as const;
const PART_DESCRIPTIONS: Record<(typeof PART_OPTIONS)[number], string> = {
  iOS: "Apple 생태계에 맞춰 안정적인 앱을 만들어요. 섬세한 디테일로 완성도 높은 경험을 설계해요.",
  AOS: "다양한 환경에서 안정적으로 동작하는 앱을 만들어요. 지속 성장 가능한 서비스를 함께 개발해요.",
  FE: "사용자 중심의 직관적이고 빠른 웹 환경을 구축합니다. 최적화된 코드로 끊김 없는 사용자 경험을 제공합니다.",
  BE: "서버와 데이터의 흐름을 설계해 서비스가 안정적으로 동작하도록 만들어요. 성능과 확장성을 고려해 빠르고 유연한 시스템을 구축해요.",
  PM: "문제를 정의하고 방향을 제시해 팀이 같은 목표를 향해 나아가도록 이끌어요. 우선순위를 정하고 실행을 조율해 제품 가치를 만듭니다.",
  PD: "사용자의 니즈를 반영한 최상의 UI/UX를 만들어요. 여러 툴을 활용해 협업하며, 더 나은 사용자 경험을 고민해요.",
};

const BANNER_TEXT = "함께 성장할 PM, 디자이너, 개발자를 기다리고 있어요.";

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  birth: "",
  region: "",
  agreedToPrivacy: false,
  part: null,
  essay: "",
  portfolioLink: "",
  portfolioFile: null,
  channels: [],
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
  backgroundImage:
    "linear-gradient(90deg, #02111f 7.926%, #072d3e 66.31%, #011924 100%), url('https://www.figma.com/api/mcp/asset/6f928e32-36e6-4c5d-886d-63789ff48cea')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  "@media (max-width: 1024px)": { padding: "160px 80px 80px" },
  "@media (max-width: 768px)": { padding: "140px 40px 50px" },
  "@media (max-width: 375px)": { padding: "160px 16px 20px" },
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
  "@media (max-width: 375px)": { fontSize: "12px", lineHeight: "15px" },
});

const BannerTitle = styled.h1({
  margin: "8px 0 0",
  color: colors.slate300,
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 375px)": { fontSize: "24px", lineHeight: "30px", width: "265px" },
});

const Container = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "80px 24px",
  "@media (max-width: 1024px)": { padding: "72px 32px" },
  "@media (max-width: 768px)": { padding: "56px 24px" },
  "@media (max-width: 375px)": { padding: "48px 16px" },
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
  "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px" },
});

const StepWrap = styled.div({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "20px",
  marginTop: "50px",
  paddingTop: "10px",
  "@media (max-width: 768px)": { gap: "12px", marginTop: "36px" },
  "@media (max-width: 375px)": { gap: "8px", marginTop: "28px" },
});

const StepLine = styled.div({
  position: "absolute",
  left: "calc(12.5% + 20px)",
  right: "calc(12.5% + 20px)",
  top: "50px",
  height: "2px",
  background: "#62748e",
  "@media (max-width: 768px)": {
    top: "40px",
    left: "calc(12.5% + 16px)",
    right: "calc(12.5% + 16px)",
  },
  "@media (max-width: 375px)": {
    top: "34px",
    left: "calc(12.5% + 12px)",
    right: "calc(12.5% + 12px)",
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
  "@media (max-width: 375px)": {
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
  "@media (max-width: 375px)": { fontSize: "12px", lineHeight: "16px" },
}));

const Card = styled.section({
  marginTop: "56px",
  borderRadius: "30px",
  background: colors.backgroundDark,
  padding: "80px",
  "@media (max-width: 1024px)": { padding: "56px 44px" },
  "@media (max-width: 768px)": { padding: "40px 24px" },
  "@media (max-width: 375px)": { marginTop: "28px", padding: "24px 16px", borderRadius: "20px" },
});

const CardTitle = styled.h3({
  margin: 0,
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px" },
});

const Fields = styled.div({
  maxWidth: "640px",
  margin: "40px auto 0",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  "@media (max-width: 375px)": { marginTop: "24px", gap: "14px" },
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
    "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px", height: "48px" },
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
  "@media (max-width: 375px)": { minHeight: "280px", fontSize: "16px", lineHeight: "24px" },
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
  "@media (max-width: 375px)": {
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
  "@media (max-width: 375px)": {
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
  "@media (max-width: 375px)": {
    width: "4px",
    height: "4px",
  },
});

const ChipGrid = styled.div({
  marginTop: "20px",
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  "@media (max-width: 375px)": { gap: "10px" },
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
  "@media (max-width: 375px)": { fontSize: "16px", lineHeight: "20px", padding: "10px 14px" },
}));

const PartDescription = styled.p({
  margin: "20px 0 0",
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "20px", lineHeight: "26px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "22px" },
  "@media (max-width: 375px)": { marginTop: "14px", fontSize: "12px", lineHeight: "18px" },
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

const UploadBox = styled.label({
  width: "100%",
  borderRadius: "10px",
  background: "#ffffff",
  padding: "40px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "12px",
  color: colors.textSecondary,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",
  textAlign: "center",
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "24px" },
});

const HiddenFile = styled.input({ display: "none" });

const ButtonRow = styled.div({
  marginTop: "56px",
  display: "flex",
  gap: "20px",
  "@media (max-width: 768px)": { marginTop: "40px" },
  "@media (max-width: 375px)": { marginTop: "28px", flexDirection: "column" },
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
  "@media (max-width: 375px)": { height: "52px", width: "100%", fontSize: "16px", minWidth: 0 },
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
  "@media (max-width: 375px)": { paddingTop: "20px", gap: "24px" },
});

const SuccessTitle = styled.h3({
  margin: 0,
  fontSize: "64px",
  lineHeight: "75px",
  fontWeight: fontWeights.bold,
  marginBottom: "20px",
  marginTop: "40px",
  "@media (max-width: 768px)": { fontSize: "44px", lineHeight: "54px" },
  "@media (max-width: 375px)": { fontSize: "32px", lineHeight: "40px" },
});

const ErrorText = styled.p({
  margin: "10px 0 0",
  color: "#ff7d7d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const FieldError = styled.p({
  margin: "6px 0 0",
  color: "#ff7d7d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

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
    if (digits.length < 10 || digits.length > 11) return "올바른 휴대폰 번호를 입력해주세요.";
    return null;
  }

  if (field === "region") {
    if (!trimmed) return "거주지역을 입력해주세요.";
    return null;
  }

  const normalized = trimmed.replace(/\s+/g, "");
  const match = normalized.match(/^(\d{4})[/.-]?(\d{2})[/.-]?(\d{2})$/);

  if (!trimmed) return "생년월일을 입력해주세요.";
  if (!match) return "생년월일은 YYYY/MM/DD 형식으로 입력해주세요.";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const validDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!validDate) return "유효한 생년월일을 입력해주세요.";
  return null;
};

export const RecruitApplySection = () => {
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [basicErrors, setBasicErrors] = useState<Partial<Record<BasicField, string>>>({});
  const [basicTouched, setBasicTouched] = useState<Partial<Record<BasicField, boolean>>>({});
  const [focusedField, setFocusedField] = useState<BasicField | null>(null);

  const stepLabels = useMemo(() => ["기본 정보", "지원 파트", "지원서", "기타 정보"], []);

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
      if (!values.agreedToPrivacy) {
        setError("개인정보 수집 및 이용에 동의해주세요.");
        return false;
      }
    }

    if (step === 2 && !values.part) {
      setError("지원 파트를 선택해주세요.");
      return false;
    }

    if (step === 3 && !values.essay.trim()) {
      setError("지원서를 입력해주세요.");
      return false;
    }

    if (step === 4 && values.channels.length === 0) {
      setError("DDD를 알게 된 경로를 1개 이상 선택해주세요.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = (event: FormEvent) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    setStep((prev) => (prev < 5 ? ((prev + 1) as Step) : prev));
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const toggleChannel = (channel: string) => {
    setValues((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((item) => item !== channel)
        : [...prev.channels, channel],
    }));
  };

  const partTitle = values.part ? `${values.part} 파트 지원서` : "지원서";
  const handleBasicBlur = (field: BasicField) => {
    setFocusedField((prev) => (prev === field ? null : prev));
    setBasicTouched((prev) => ({ ...prev, [field]: true }));
    const nextError = validateBasicField(field, values[field]);
    setBasicErrors((prev) => ({ ...prev, [field]: nextError ?? "" }));
  };

  const handleBasicChange = (field: BasicField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
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

      <Container>
        {step < 5 ? (
          <>
            <FormTitle>DDD 지원서</FormTitle>
            <FormDescription>{BANNER_TEXT}</FormDescription>
          </>
        ) : null}

        {step < 5 ? (
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
                      <Field>
                        <Label>
                          이메일 <Required hasError={Boolean(basicErrors.email)}>*</Required>
                        </Label>
                        <Hint>합격 결과 안내 이메일이 발송됩니다.</Hint>
                        <Input
                          placeholder="test@email.com"
                          value={values.email}
                          hasError={Boolean(basicErrors.email)}
                          isFocused={focusedField === "email"}
                          hasValue={Boolean(values.email.trim())}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => handleBasicBlur("email")}
                          onChange={(event) => handleBasicChange("email", event.target.value)}
                        />
                        {basicErrors.email ? <FieldError>{basicErrors.email}</FieldError> : null}
                      </Field>
                      <Field>
                        <Label>
                          휴대폰 번호 <Required hasError={Boolean(basicErrors.phone)}>*</Required>
                        </Label>
                        <Input
                          placeholder="010-0000-0000"
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
                        {basicErrors.region ? <FieldError>{basicErrors.region}</FieldError> : null}
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
                      {PART_OPTIONS.map((option) => (
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
                        {PART_DESCRIPTIONS[values.part as (typeof PART_OPTIONS)[number]]}
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
                      Q1
                    </p>
                    <p style={{ margin: 0, fontSize: 24, lineHeight: "30px", fontWeight: 500 }}>
                      가장 애착이 가는 작업물을 소개해주세요. 포트폴리오 링크를 포함하거나 과정을
                      상세히 설명해주세요.
                    </p>
                  </AnswerHeader>
                  <AnswerBody>
                    <TextArea
                      placeholder="1,000자 이내로 입력해주세요."
                      value={values.essay}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, essay: event.target.value }))
                      }
                    />
                  </AnswerBody>

                  <div style={{ marginTop: 20 }}>
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
                        포트폴리오 선택
                      </p>
                      <p style={{ margin: 0, fontSize: 24, lineHeight: "30px", fontWeight: 500 }}>
                        PDF 파일 또는 링크를 첨부해주세요. (최대 10MB, PDF만 가능)
                      </p>
                    </AnswerHeader>
                    <AnswerBody style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <UploadBox>
                        <HiddenFile
                          type="file"
                          accept="application/pdf"
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              portfolioFile: event.target.files?.[0] ?? null,
                            }))
                          }
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="46"
                          height="57"
                          viewBox="0 0 46 57"
                          fill="none"
                        >
                          <path
                            d="M11.5 2H29.6L44 16.4V55H2V2H11.5Z"
                            stroke="#CAD5E2"
                            strokeWidth="3"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M29 2V16.5H43.5"
                            stroke="#CAD5E2"
                            strokeWidth="3"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {values.portfolioFile
                          ? values.portfolioFile.name
                          : "PDF 파일을 첨부해주세요. (최대 10MB, PDF만 가능)"}
                      </UploadBox>
                      <Input
                        placeholder="포트폴리오 링크를 입력해주세요. (https://)"
                        value={values.portfolioLink}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, portfolioLink: event.target.value }))
                        }
                      />
                    </AnswerBody>
                  </div>
                </>
              ) : null}

              {step === 4 ? (
                <Card>
                  <CardTitle>기타 정보</CardTitle>
                  <Fields style={{ maxWidth: "100%", marginTop: "28px" }}>
                    <Label>
                      DDD를 알게 된 경로 <Required>*</Required>
                    </Label>
                    <ChipGrid>
                      {CHANNEL_OPTIONS.map((option) => (
                        <Chip
                          type="button"
                          key={option}
                          selected={values.channels.includes(option)}
                          onClick={() => toggleChannel(option)}
                        >
                          {option}
                        </Chip>
                      ))}
                    </ChipGrid>
                  </Fields>
                </Card>
              ) : null}

              {error ? <ErrorText>{error}</ErrorText> : null}

              <ButtonRow>
                {step > 1 ? (
                  <ActionButton type="button" onClick={handlePrev}>
                    이전 <Arrow back />
                  </ActionButton>
                ) : null}
                <ActionButton type="submit" primary full>
                  다음 <Arrow />
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
            <ActionButton primary full onClick={() => setStep(1)}>
              완료
            </ActionButton>
          </SuccessWrap>
        )}
      </Container>
    </PageSection>
  );
};
