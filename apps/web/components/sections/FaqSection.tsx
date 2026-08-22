"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";

interface AnswerSegment {
  text: string;
  emphasis?: boolean;
}

interface FaqItem {
  question: string;
  /** 문단 배열. 각 문단은 일반 텍스트/강조 텍스트 조각으로 구성된다. */
  answer: AnswerSegment[][];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "모집 및 활동 일정이 궁금해요",
    answer: [
      [
        {
          text: "DDD는 1년에 2번 운영됩니다. 구체적인 일시는 매 기수 모집 전에 안내드립니다. (봄 기수 : 2월 모집 + 3~6월 활동, 가을 기수 : 9월 모집 + 10~1월 활동)",
        },
      ],
    ],
  },
  {
    question: "지원자격은 무엇인가요?",
    answer: [
      [
        {
          text: "DDD는 대학생/취준생/직장인이며 20살 이상인 성인이라면 누구나 참여 가능합니다. 직업, 연령 등 자격 요건에 제한을 두지 않습니다.",
        },
      ],
    ],
  },
  {
    question: "실력이 뛰어난 사람만 지원할 수 있나요?",
    answer: [
      [
        {
          text: "실력이 뛰어난지가 선발의 기준은 아닙니다. 다만 팀 프로젝트를 진행하는 사이드 프로젝트 특성상 ",
        },
        { text: "개인 프로젝트를 수행할 수 있을 정도의 기본적인 기술 숙련도", emphasis: true },
        { text: "는 필요합니다." },
      ],
      [
        { text: "DDD는 교육 중심 프로그램이 아니라 " },
        { text: "실제 프로젝트 경험을 중심으로 운영되는 커뮤니티", emphasis: true },
        { text: "입니다. 따라서 별도의 교육 커리큘럼은 없으며, 활동 외에도 " },
        { text: "개인적인 학습과 노력이 필요합니다.", emphasis: true },
      ],
      [
        { text: "무엇보다 DDD에서는 " },
        { text: "4개월 동안 꾸준히 참여할 수 있는 책임감과 성장 의지", emphasis: true },
        { text: "를 가장 중요하게 보고 있습니다." },
      ],
    ],
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
  "@media (max-width: 767px)": { padding: "80px 16px" },
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
  alignItems: "center",

  // 375 의 Gutter 토큰은 12 다.
  "@media (max-width: 767px)": { gap: "12px" },
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: "20px",
  fontWeight: fontWeights.medium,
  lineHeight: "28px",
  color: colors.textInverse,
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: "28px",
  fontWeight: fontWeights.semiBold,
  lineHeight: "32px",
  color: colors.textInverse,
  "@media (max-width: 1024px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 768px)": {
    fontSize: "28px",
    lineHeight: "34px",
  },
  "@media (max-width: 767px)": {
    fontSize: "16px",
    lineHeight: "20px",
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

const AnswerParagraphs = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const AccordionAnswer = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.regular,
  lineHeight: lineHeights.paragraphMedium,
  color: colors.slate300,
  "@media (max-width: 1024px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "18px",
  },
  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "15px",
  },
});

const AnswerEmphasis = styled.strong({
  fontWeight: fontWeights.semiBold,
  color: colors.textInverse,
});

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
                    <AnswerParagraphs>
                      {answer.map((paragraph, paragraphIndex) => (
                        <AccordionAnswer key={paragraph[0].text}>
                          {paragraphIndex === 0 && "A. "}
                          {paragraph.map(({ text, emphasis }) =>
                            emphasis ? (
                              <AnswerEmphasis key={text}>{text}</AnswerEmphasis>
                            ) : (
                              <span key={text}>{text}</span>
                            ),
                          )}
                        </AccordionAnswer>
                      ))}
                    </AnswerParagraphs>
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
