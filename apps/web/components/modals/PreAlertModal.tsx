"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";

export const PRE_ALERT_MODAL_OPEN_EVENT = "ddd:open-pre-alert-modal";

export const openPreAlertModal = () => {
  window.dispatchEvent(new Event(PRE_ALERT_MODAL_OPEN_EVENT));
};

type FormValues = {
  email: string;
};

type ModalStep = "form" | "success" | "confirm-close";

const INITIAL_VALUES: FormValues = {
  email: "",
};

const MODAL_DECORATION_IMAGE =
  "https://www.figma.com/api/mcp/asset/8acad552-df88-46ca-8a7f-0a09b34f367d";
const MODAL_SUCCESS_IMAGE =
  "https://www.figma.com/api/mcp/asset/7cbb49bf-a374-453a-9c95-c1c69fddc903";

const Overlay = styled.div<{ open: boolean }>(({ open }) => ({
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: open ? "flex" : "none",
  alignItems: "flex-start",
  justifyContent: "center",
  background: "rgba(12, 14, 15, 0.72)",
  padding: "200px 24px 24px",

  "@media (max-width: 1024px)": {
    paddingTop: "304px",
  },
  "@media (max-width: 768px)": {
    paddingTop: "304px",
  },
  "@media (max-width: 375px)": {
    alignItems: "flex-start",
    padding: "225px 16px 16px",
  },
}));

const ModalWrap = styled.div({
  position: "relative",
  width: "100%",
  maxWidth: "846px",
});

const ModalCard = styled.div({
  width: "100%",
  background: "#ffffff",
  borderRadius: "30px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
  padding: "120px 80px 80px",
  color: "#202325",
  position: "relative",

  "@media (max-width: 768px)": {
    maxWidth: "643px",
    borderRadius: "30px",
    padding: "80px 40px 40px",
  },
  "@media (max-width: 375px)": {
    maxWidth: "343px",
    borderRadius: "20px",
    padding: "80px 12px 40px",
  },
});

const Header = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  position: "relative",
});

const Title = styled.h2({
  margin: 0,
  color: "#202325",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,

  "@media (max-width: 768px)": {
    fontSize: "34px",
    lineHeight: "45px",
  },
  "@media (max-width: 375px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
});

const FloatingCloseArea = styled.div({
  position: "absolute",
  right: "20px",
  top: "20px",
  zIndex: 5,
  width: "88px",
  height: "88px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",

  "@media (max-width: 768px)": {
    right: "12px",
    top: "12px",
  },
  "@media (max-width: 375px)": {
    width: "60px",
    height: "60px",
    right: "8px",
    top: "8px",
  },
});

const CloseButton = styled.button({
  width: "48px",
  height: "48px",
  border: "none",
  borderRadius: "999px",
  background: "#e2e8f0",
  color: "#0c0e0f",
  cursor: "pointer",
  fontSize: "22px",
  lineHeight: "22px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",

  "@media (max-width: 375px)": {
    width: "28px",
    height: "28px",
    fontSize: "14px",
    lineHeight: "14px",
  },
});

const Description = styled.p({
  margin: "12px 0 0",
  color: "#62748e",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,
  maxWidth: "686px",

  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
    maxWidth: "297px",
  },

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
    maxWidth: "297px",
  },
});

const Decoration = styled.img({
  position: "absolute",
  right: "0",
  top: "0",
  width: "125px",
  height: "125px",
  objectFit: "cover",
  opacity: 0.3,
  pointerEvents: "none",

  "@media (max-width: 768px)": {
    width: "102px",
    height: "102px",
  },
  "@media (max-width: 375px)": {
    width: "86px",
    height: "86px",
    right: "2px",
    top: "78px",
  },
});

const Form = styled.form({
  marginTop: "80px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",

  "@media (max-width: 375px)": {
    marginTop: "40px",
  },
});

const InputGroup = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const InputLabel = styled.div({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: "#525252",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const RequiredDot = styled.span({
  color: "#ff3b30",
});

const InputFieldWrap = styled.div({
  position: "relative",
  width: "100%",
});

const Input = styled.input<{ invalid?: boolean }>(({ invalid }) => ({
  width: "100%",
  height: "60px",
  borderRadius: "30px",
  border: invalid ? "1.5px solid #ff7c7c" : "1.5px solid #90a1b9",
  background: "#ffffff",
  color: "#202325",
  padding: "0 56px 0 24px",
  fontSize: "20px",
  lineHeight: "28px",
  outline: "none",

  "::placeholder": {
    color: "#90a1b9",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: fontWeights.medium,
  },

  "@media (max-width: 768px)": {
    "::placeholder": {
      fontSize: "14px",
      lineHeight: "18px",
    },
  },
  "@media (max-width: 375px)": {
    "::placeholder": {
      fontSize: "10px",
      lineHeight: "13px",
      fontWeight: fontWeights.regular,
    },
  },
}));

const InputErrorIcon = styled.span({
  position: "absolute",
  right: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "#ff3b30",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: fontWeights.bold,
  lineHeight: "18px",
  textAlign: "center",
  pointerEvents: "none",
});

const ErrorText = styled.p({
  margin: "4px 0 0",
  color: "#ff8d8d",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
});

const ActionRow = styled.div({
  marginTop: "8px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
});

const PrimaryButton = styled.button({
  height: "65px",
  padding: "20px 50px",
  borderRadius: "100px",
  border: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "@media (max-width: 768px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 375px)": {
    height: "56px",
    padding: "30px 40px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const SuccessWrap = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  padding: "0 80px",
  minHeight: "383px",

  "@media (max-width: 375px)": {
    padding: "0 40px",
    minHeight: "300px",
  },
});

const SuccessImage = styled.img({
  width: "180px",
  height: "180px",
  objectFit: "cover",

  "@media (max-width: 375px)": {
    width: "150px",
    height: "150px",
  },
});

const SuccessTitle = styled.h3({
  margin: 0,
  color: "#1e1e1e",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  textAlign: "center",
  whiteSpace: "pre-line",

  "@media (max-width: 375px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
});

const SuccessDescription = styled.p({
  margin: 0,
  color: "#525252",
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.medium,
  textAlign: "center",

  "@media (max-width: 375px)": {
    fontSize: "12px",
    lineHeight: "15px",
  },
});

const SuccessTimerText = styled.p({
  margin: 0,
  color: "#0d82f9",
  fontSize: "12px",
  lineHeight: "15px",
  fontWeight: fontWeights.regular,
  textAlign: "center",

  "@media (max-width: 375px)": {
    fontSize: "9px",
    lineHeight: "12px",
  },
});

const ConfirmWrap = styled.div({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "60px",
  padding: "0 80px",
  minHeight: "332px",

  "@media (max-width: 375px)": {
    minHeight: "260px",
    padding: "0 20px",
    gap: "40px",
  },
});

const ConfirmHeader = styled.div({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  textAlign: "center",
});

const ConfirmTitle = styled.h3({
  margin: 0,
  color: "#202325",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,

  "@media (max-width: 375px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
});

const ConfirmDescription = styled.p({
  margin: 0,
  color: "#62748e",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: fontWeights.medium,
  whiteSpace: "pre-line",

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const ConfirmActions = styled.div({
  width: "430px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",

  "@media (max-width: 375px)": {
    width: "100%",
  },
});

const ConfirmPrimaryButton = styled.button({
  width: "100%",
  height: "65px",
  borderRadius: "100px",
  border: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "@media (max-width: 375px)": {
    height: "56px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const ConfirmSecondaryButton = styled.button({
  width: "100%",
  height: "65px",
  borderRadius: "100px",
  border: "none",
  background: "#f1f5f9",
  color: "#202325",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "@media (max-width: 375px)": {
    height: "56px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

export const PreAlertModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [showError, setShowError] = useState(false);

  const hasAnyInput = useMemo(
    () => Object.values(values).some((value) => value.trim().length > 0),
    [values],
  );

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      setStep("form");
      setValues(INITIAL_VALUES);
      setShowError(false);
    };

    const escHandler = (event: KeyboardEvent) => {
      if (!open || event.key !== "Escape") return;
      if (step === "success") {
        setOpen(false);
        return;
      }
      if (hasAnyInput) {
        setStep("confirm-close");
        return;
      }
      setOpen(false);
    };

    window.addEventListener(PRE_ALERT_MODAL_OPEN_EVENT, openHandler);
    window.addEventListener("keydown", escHandler);
    return () => {
      window.removeEventListener(PRE_ALERT_MODAL_OPEN_EVENT, openHandler);
      window.removeEventListener("keydown", escHandler);
    };
  }, [hasAnyInput, open, step]);

  useEffect(() => {
    if (!open || step !== "success") return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setStep("form");
      setValues(INITIAL_VALUES);
      setShowError(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [open, step]);

  const onCloseRequest = () => {
    if (step === "success") {
      setOpen(false);
      return;
    }
    if (hasAnyInput) {
      setStep("confirm-close");
      return;
    }
    setOpen(false);
  };

  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    onCloseRequest();
  };

  const validate = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
    return emailOk;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStep("success");
  };

  if (!open) return null;

  return (
    <Overlay open={open} onClick={onBackdropClick}>
      <ModalWrap>
        <FloatingCloseArea>
          <CloseButton type="button" aria-label="닫기" onClick={onCloseRequest}>
            ×
          </CloseButton>
        </FloatingCloseArea>
        <ModalCard role="dialog" aria-modal="true" aria-label="사전 알림 신청 모달">
          {step === "form" && (
            <>
              <Header>
                <div>
                  <Title>12기 모집 알림 신청</Title>
                  <Description>DDD 14기 모집이 시작되면 가장 먼저 알려드릴게요.</Description>
                </div>
                <Decoration src={MODAL_DECORATION_IMAGE} alt="" />
              </Header>

              <Form onSubmit={onSubmit}>
                <InputGroup>
                  <InputLabel>
                    이메일 <RequiredDot>*</RequiredDot>
                  </InputLabel>
                  <InputFieldWrap>
                    <Input
                      placeholder="이메일 주소를 입력해주세요."
                      value={values.email}
                      invalid={showError && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                    {showError && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? (
                      <InputErrorIcon aria-hidden>!</InputErrorIcon>
                    ) : null}
                  </InputFieldWrap>
                </InputGroup>
                {showError ? (
                  <ErrorText>example@example.com 형식에 맞게 입력해주세요.</ErrorText>
                ) : null}
                <ActionRow>
                  <PrimaryButton type="submit">모집 알림 신청하기</PrimaryButton>
                </ActionRow>
              </Form>
            </>
          )}

          {step === "success" && (
            <>
              <SuccessWrap>
                <SuccessImage src={MODAL_SUCCESS_IMAGE} alt="" />
                <SuccessTitle>{"12기 모집 알림 신청이\n완료되었어요!"}</SuccessTitle>
                <SuccessDescription>DDD 크루 모집 시, 이메일로 알려드릴게요.</SuccessDescription>
                <SuccessTimerText>3초 뒤에 자동으로 화면이 닫힙니다.</SuccessTimerText>
              </SuccessWrap>
            </>
          )}

          {step === "confirm-close" && (
            <>
              <ConfirmWrap>
                <ConfirmHeader>
                  <ConfirmTitle>모집 알림을 신청하지 않고 닫으실 건가요?</ConfirmTitle>
                  <ConfirmDescription>
                    {"지금 닫으시면 작성된 내용은 모두 사라집니다.\n그래도 닫으시겠습니까?"}
                  </ConfirmDescription>
                </ConfirmHeader>
                <ConfirmActions>
                  <ConfirmPrimaryButton type="button" onClick={() => setOpen(false)}>
                    나가기
                  </ConfirmPrimaryButton>
                  <ConfirmSecondaryButton type="button" onClick={() => setStep("form")}>
                    취소
                  </ConfirmSecondaryButton>
                </ConfirmActions>
              </ConfirmWrap>
            </>
          )}
        </ModalCard>
      </ModalWrap>
    </Overlay>
  );
};
