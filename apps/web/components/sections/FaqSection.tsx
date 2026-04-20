"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "현직자가 아니어도 지원할 수 있나요?",
    answer: "네, 가능해요. 직군과 무관하게 함께 만들고 성장하려는 열정이 있다면 누구든 환영해요.",
  },
  {
    question: "사이드프로젝트 경험이 없어도 괜찮나요?",
    answer:
      "네, 없어도 괜찮아요. DDD는 처음 사이드프로젝트를 경험하는 분들도 함께 성장할 수 있는 환경을 제공해요.",
  },
  {
    question: "팀은 어떻게 구성되나요?",
    answer:
      "기수별로 PM, 디자이너, 개발자(iOS, AOS, WEB)가 함께하는 팀으로 구성되며, 모집 과정에서 적절히 배정돼요.",
  },
  {
    question: "정기 모임은 어떻게 진행되나요?",
    answer:
      "격주 토요일에 오프라인 정기 모임이 진행되며, 팀 프로젝트 진행 상황 공유 및 네트워킹 시간을 가져요.",
  },
  {
    question: "한 기수 활동 기간은 얼마나 되나요?",
    answer:
      "한 기수는 약 6개월로 구성되며, 기수 종료 시 데모데이를 통해 팀별 프로젝트 결과물을 발표해요.",
  },
];

const Section = styled.section({
  width: "100%",
  padding: "120px 80px",
  background:
    "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1280 842' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(3.7533e-14 60.653 -138.31 3.1761e-13 960 -407.6)'><stop stop-color='rgba(46,113,255,0.4)' offset='0'/><stop stop-color='rgba(38,88,195,0.55)' offset='0.25'/><stop stop-color='rgba(29,64,135,0.7)' offset='0.5'/><stop stop-color='rgba(21,39,75,0.85)' offset='0.75'/><stop stop-color='rgba(16,26,45,0.925)' offset='0.875'/><stop stop-color='rgba(12,14,15,1)' offset='1'/></radialGradient></defs></svg>\"), linear-gradient(90deg, rgb(12, 14, 15) 0%, rgb(12, 14, 15) 100%)",
  backgroundSize: "cover",
  display: "flex",
  justifyContent: "center",

  "@media (max-width: 1024px)": { padding: "120px 80px" },
  "@media (max-width: 768px)": { padding: "100px 40px" },
  "@media (max-width: 375px)": { padding: "80px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  display: "flex",
  flexDirection: "column",
  gap: "56px",
});

const TitleArea = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.textInverse,

  "@media (max-width: 375px)": {
    fontSize: "20px",
    lineHeight: "28px",
  },
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,

  "@media (max-width: 375px)": {
    fontSize: "28px",
    lineHeight: "32px",
  },
});

const AccordionList = styled.dl({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const AccordionItem = styled.div({
  borderBottom: `1px solid ${colors.border}`,
  contain: "layout paint",
});

interface AccordionTriggerProps {
  isOpen: boolean;
}

const AccordionTrigger = styled.button<AccordionTriggerProps>({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "36px",
  height: "73px",
  padding: "10px",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
});

const AccordionQuestion = styled.dt({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  color: colors.textInverse,
  flex: "1 0 0",

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const ChevronIcon = styled.svg({
  width: "24px",
  height: "24px",
  flexShrink: 0,
  display: "block",
});

const AccordionBody = styled.dd<{ isOpen: boolean }>(({ isOpen }) => ({
  display: "grid",
  gridTemplateRows: isOpen ? "1fr" : "0fr",
  opacity: isOpen ? 1 : 0,
  padding: "0 24px",
  transition: "grid-template-rows 0.2s ease, opacity 0.15s ease",
  pointerEvents: isOpen ? "auto" : "none",
}));

const AccordionBodyInner = styled.div<{ isOpen: boolean }>(({ isOpen }) => ({
  overflow: "hidden",
  minHeight: 0,
  paddingTop: isOpen ? "4px" : "0",
  paddingBottom: isOpen ? "24px" : "0",
}));

const AccordionAnswer = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.slate300,

  "@media (max-width: 375px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>DDD에 대해 궁금한 점이 있으신가요?</SectionTitle>
        </TitleArea>
        <AccordionList>
          {FAQ_ITEMS.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <AccordionItem key={question}>
                <AccordionTrigger
                  aria-expanded={isOpen}
                  onClick={() => handleToggle(index)}
                  isOpen={isOpen}
                >
                  <AccordionQuestion>Q. {question}</AccordionQuestion>
                  <ChevronIcon
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    {isOpen ? (
                      <path d="M12 7.5L2 17.5H22L12 7.5Z" fill="white" />
                    ) : (
                      <path d="M12 17.5L2 7.5H22L12 17.5Z" fill="white" />
                    )}
                  </ChevronIcon>
                </AccordionTrigger>
                <AccordionBody isOpen={isOpen}>
                  <AccordionBodyInner isOpen={isOpen}>
                    <AccordionAnswer>A. {answer}</AccordionAnswer>
                  </AccordionBodyInner>
                </AccordionBody>
              </AccordionItem>
            );
          })}
        </AccordionList>
      </Inner>
    </Section>
  );
};
