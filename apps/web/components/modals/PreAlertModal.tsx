"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { ApiError } from "@ddd/api";
import { subscribeEarlyNotificationWithActiveCohort } from "@/lib/api/early-notification";
import successIcon from "@/public/images/success.png";
import modalImageIcon from "@/public/images/modal_image.png";

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

/**
 * 사전 알림 안내 문구 — 모집 예정 기수가 없으면 기수 번호 없이 노출한다.
 *
 * `cohortName` 은 활성 기수 응답의 기수명("14기")이고, 모집 예정 기수가 없거나
 * 기수 조회에 실패하면 null 이다. 이때 특정 기수로 안내하면 어드민에 없는 기수가
 * 홈페이지에 뜨므로("14기 모집 알림 신청") 기수를 뺀 문구로 떨어진다.
 */
const buildAlertTexts = (cohortName: string | null) => ({
  title: cohortName ? `${cohortName} 모집 알림 신청` : "모집 알림 신청",
  description: cohortName
    ? `DDD ${cohortName} 모집이 시작되면 가장 먼저 알려드릴게요.`
    : "DDD 신규 기수 모집이 시작되면 가장 먼저 알려드릴게요.",
  successTitle: cohortName
    ? `${cohortName} 모집 알림 신청이\n완료되었어요!`
    : "모집 알림 신청이\n완료되었어요!",
});

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
  "@media (max-width: 767px)": {
    alignItems: "flex-start",
    padding: "225px 16px 16px",
  },
}));

/**
 * 카드 폭은 반드시 여기(wrap)에 걸어야 한다.
 *
 * Overlay 의 중앙 정렬 기준도, FloatingCloseArea 의 우측 정렬 기준도 이 wrap 이다.
 * 폭을 ModalCard 쪽에 두면 카드가 wrap 보다 좁아지는 순간 카드는 좌측으로 밀리고
 * 닫기 버튼만 wrap 우측 끝에 남아 서로 분리된다.
 */
const ModalWrap = styled.div({
  position: "relative",
  width: "100%",
  maxWidth: "846px",

  "@media (max-width: 1024px)": { maxWidth: "643px" },
  "@media (max-width: 767px)": { maxWidth: "343px" },
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
  // 열릴 때 포커스를 받는 대상이지만 조작 요소가 아니라 링은 그리지 않는다.
  outline: "none",

  // 1024 프레임과 768 프레임의 팝업은 643x470 으로 동일하다.
  "@media (max-width: 1024px)": {
    borderRadius: "30px",
    padding: "80px 40px 40px",
  },
  "@media (max-width: 767px)": {
    borderRadius: "20px",
    padding: "80px 16px 40px",
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
  "@media (max-width: 1024px)": {
    fontSize: "34px",
    lineHeight: "45px",
  },
  "@media (max-width: 767px)": {
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
  "@media (max-width: 767px)": {
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

  "@media (max-width: 767px)": {
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
  /*
   * 한글은 기본 줄바꿈 규칙에서 음절 단위로 끊긴다. 그대로 두면 좁은 폭에서
   * "알려드릴 / 게요." 처럼 단어 한가운데가 갈라져, 시안의 어절 단위 두 줄과
   * 다른 모양이 된다.
   */
  wordBreak: "keep-all",

  "@media (max-width: 1024px)": {
    fontSize: "20px",
    lineHeight: "25px",
    maxWidth: "297px",
  },

  /*
   * 시안(375)의 설명 폭은 약 190px 로, 우측 3D 로고와 나란히 놓이는 자리다.
   * 297px 은 카드 내부 폭(311px)을 거의 다 먹어 로고 위를 침범했다.
   */
  "@media (max-width: 767px)": {
    fontSize: "16px",
    lineHeight: "20px",
    maxWidth: "200px",
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

  "@media (max-width: 1024px)": {
    width: "102px",
    height: "102px",
  },
  /*
   * 시안(375)에서 로고는 제목·설명과 같은 높이의 우측 상단에 또렷하게 놓인다.
   * top:78px 은 설명 두 번째 줄 위로 내려앉아 글자와 겹쳐 있었고, 데스크톱의
   * 워터마크용 투명도(0.3)도 이 자리에서는 시안보다 흐렸다.
   */
  "@media (max-width: 767px)": {
    width: "70px",
    height: "70px",
    right: 0,
    top: "8px",
    opacity: 1,
  },
});

const Form = styled.form({
  marginTop: "80px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",

  "@media (max-width: 767px)": {
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

/** 시안의 필수 표시는 빨간 별표가 아니라 라벨 오른쪽의 작은 파란 점이다. */
const RequiredDot = styled.span({
  width: "5px",
  height: "5px",
  borderRadius: "999px",
  background: colors.primary,
  display: "inline-block",
  flexShrink: 0,

  "@media (max-width: 767px)": {
    width: "4px",
    height: "4px",
  },
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
  /*
   * 입력 높이는 시안 기준으로 낮추되, 글자 크기는 16px 아래로 내리지 않는다.
   * iOS Safari 는 16px 미만 입력에 포커스가 가면 페이지를 확대해 버린다.
   * 작게 보여야 하는 것은 placeholder 뿐이므로 거기에만 12px 을 건다.
   */
  "@media (max-width: 767px)": {
    height: "48px",
    padding: "0 44px 0 20px",
    fontSize: "16px",
    lineHeight: "20px",

    "::placeholder": {
      fontSize: "12px",
      lineHeight: "16px",
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

  "@media (max-width: 1024px)": {
    fontSize: "19px",
    lineHeight: "26px",
  },
  "@media (max-width: 768px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  /*
   * 세로 패딩 30px(합 60px)이 height 56px 보다 커서, border-box 안에 글자가
   * 들어가지 못하고 버튼이 시안보다 한참 부풀어 있었다. 높이로만 잡는다.
   */
  "@media (max-width: 767px)": {
    height: "48px",
    padding: "0 32px",
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
  minHeight: "383px",

  "@media (max-width: 767px)": {
    padding: "0 40px",
    minHeight: "300px",
  },
});

const SuccessImage = styled.img({
  width: "180px",
  height: "180px",
  objectFit: "cover",

  "@media (max-width: 767px)": {
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
  "@media (max-width: 1024px)": {
    fontSize: "34px",
    lineHeight: "45px",
  },
  "@media (max-width: 768px)": {
    fontSize: "30px",
    lineHeight: "36px",
  },
  "@media (max-width: 767px)": {
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

  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "16px",
  },
  "@media (max-width: 767px)": {
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

  "@media (max-width: 1024px)": {
    fontSize: "11px",
    lineHeight: "14px",
  },
  "@media (max-width: 768px)": {
    fontSize: "10px",
    lineHeight: "14px",
  },
  "@media (max-width: 767px)": {
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

  "@media (max-width: 767px)": {
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
  "@media (max-width: 1024px)": {
    fontSize: "34px",
    lineHeight: "45px",
  },
  "@media (max-width: 767px)": {
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

  "@media (max-width: 1024px)": {
    fontSize: "25px",
    lineHeight: "25px",
  },
  "@media (max-width: 767px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const ConfirmActions = styled.div({
  width: "430px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",

  "@media (max-width: 767px)": {
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

  "@media (max-width: 1024px)": {
    height: "60px",
    fontSize: "19px",
    lineHeight: "26px",
  },
  "@media (max-width: 767px)": {
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

  "@media (max-width: 1024px)": {
    height: "60px",
    fontSize: "19px",
    lineHeight: "26px",
  },
  "@media (max-width: 767px)": {
    height: "56px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

export const PreAlertModal = ({ cohortName = null }: { cohortName?: string | null }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [showError, setShowError] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const hasAnyInput = useMemo(
    () => Object.values(values).some((value) => value.trim().length > 0),
    [values],
  );

  const alertTexts = useMemo(() => buildAlertTexts(cohortName), [cohortName]);

  // 트랩 범위는 ModalCard 가 아니라 wrap 이다 — 닫기 버튼이 카드 바깥에 있다.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /**
   * 모달 안의 포커스 가능한 요소 — step 마다 내용이 통째로 바뀌므로 매번 새로 조회한다.
   * `offsetParent` 로 숨겨진 요소를 걸러야 닫힌 단계의 잔여 버튼으로 포커스가 새지 않는다.
   */
  const getFocusable = useCallback((): HTMLElement[] => {
    const card = wrapRef.current;
    if (!card) return [];
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(card.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => element.offsetParent !== null,
    );
  }, []);

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      setStep("form");
      setValues(INITIAL_VALUES);
      setShowError(false);
      setSubmitErrorMessage(null);
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
      setSubmitErrorMessage(null);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [open, step]);

  useEffect(() => {
    if (!open) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  // 열기 직전에 포커스가 있던 요소를 기억해 두었다가, 닫힐 때 그 자리로 되돌린다.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    return () => {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [open]);

  /**
   * 열릴 때, 그리고 step 이 바뀔 때마다 포커스를 다이얼로그 자신에게 들인다.
   *
   * 첫 포커스 가능 요소(= 닫기 버튼)를 잡으면 모달이 뜨자마자 그 버튼에 브라우저
   * 기본 포커스 링이 그려져, 아무것도 누르지 않았는데 눌린 것처럼 보였다.
   * role="dialog" 컨테이너를 잡으면 스크린리더에 모달 진입은 그대로 알려지고,
   * 이어지는 Tab 은 아래 트랩이 모달 안에 가둔다.
   */
  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      cardRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, step]);

  // Tab / Shift+Tab 을 모달 경계에서 순환시킨다 — aria-modal 만으로는 포커스가 갇히지 않는다.
  useEffect(() => {
    if (!open) return;

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOutside = !wrapRef.current?.contains(active);

      if (event.shiftKey && (isOutside || active === first)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && (isOutside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open, getFocusable]);

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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setShowError(true);
      setSubmitErrorMessage(null);
      return;
    }
    setShowError(false);
    setSubmitErrorMessage(null);

    try {
      await subscribeEarlyNotificationWithActiveCohort(values.email);
      setStep("success");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitErrorMessage(error.message);
        return;
      }
      if (error instanceof Error && error.message) {
        setSubmitErrorMessage(error.message);
        return;
      }
      setSubmitErrorMessage("사전 알림 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (!open) return null;

  return (
    <Overlay open={open} onClick={onBackdropClick}>
      <ModalWrap ref={wrapRef}>
        <FloatingCloseArea>
          <CloseButton type="button" aria-label="닫기" onClick={onCloseRequest}>
            ×
          </CloseButton>
        </FloatingCloseArea>
        <ModalCard
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-label="사전 알림 신청 모달"
          tabIndex={-1}
        >
          {step === "form" && (
            <>
              <Header>
                <div>
                  <Title>{alertTexts.title}</Title>
                  <Description>{alertTexts.description}</Description>
                </div>
                <Decoration src={modalImageIcon.src} alt="" />
              </Header>

              <Form onSubmit={onSubmit}>
                <InputGroup>
                  <InputLabel>
                    이메일
                    <RequiredDot aria-hidden />
                  </InputLabel>
                  <InputFieldWrap>
                    <Input
                      placeholder="이메일 주소를 입력해주세요."
                      aria-label="이메일"
                      aria-required="true"
                      value={values.email}
                      invalid={showError && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)}
                      onChange={(event) => {
                        setValues((prev) => ({ ...prev, email: event.target.value }));
                        setSubmitErrorMessage(null);
                        if (showError) setShowError(false);
                      }}
                    />
                    {showError && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? (
                      <InputErrorIcon aria-hidden>!</InputErrorIcon>
                    ) : null}
                  </InputFieldWrap>
                </InputGroup>
                {showError ? (
                  <ErrorText>example@example.com 형식에 맞게 입력해주세요.</ErrorText>
                ) : null}
                {!showError && submitErrorMessage ? (
                  <ErrorText>{submitErrorMessage}</ErrorText>
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
                <SuccessImage src={successIcon.src} alt="" />
                <SuccessTitle>{alertTexts.successTitle}</SuccessTitle>
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
