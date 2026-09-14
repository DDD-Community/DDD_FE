import type {
  ApplicationQuestionType,
  CohortPartName,
  PublicCohortDto,
  PublicCohortPart,
  PublicCohortPartDetail,
} from "@ddd/api";
import type { RecruitStatus } from "@/constants/recruit";

/**
 * 지원서에서 노출하는 파트 목록 — 배열 순서가 곧 칩 노출 순서다.
 *
 * 이 값은 화면 문구가 아니라 식별자다. 선택한 파트가 `answers.part` 로 지원서에 함께
 * 저장되므로, 표기를 바꾸겠다고 값을 고치면 이미 제출된 지원서와 철자가 갈린다.
 * 보여줄 문구는 `APPLY_PART_LABELS` 로 따로 둔다.
 */
export const APPLY_PART_OPTIONS = ["iOS", "AOS", "FE", "BE", "PM", "PD"] as const;
export type ApplyPartOption = (typeof APPLY_PART_OPTIONS)[number];

/** 화면에 표시할 문구. 값(AOS)과 표기(Android)가 다른 건 이것뿐이다. */
export const APPLY_PART_LABELS: Record<ApplyPartOption, string> = {
  iOS: "iOS",
  AOS: "Android",
  FE: "FE",
  BE: "BE",
  PM: "PM",
  PD: "PD",
};

/** 지원 가능한(모집 오픈된) 파트 1건 — 칩 하나가 곧 cohortPartId 하나다. */
export type ApplyPart = {
  option: ApplyPartOption;
  cohortPartId: number;
};

/** BE ctaStatus → 웹 모집 상태 */
const RECRUIT_STATUS_BY_CTA: Record<NonNullable<PublicCohortDto["ctaStatus"]>, RecruitStatus> = {
  PRE_NOTIFICATION: "preNotification",
  APPLY: "open",
  CLOSED: "closed",
};

/**
 * 활성 기수가 없어도 BE 는 404 가 아니라 200 + `hasActiveCohort: false` 를 준다.
 * (2026-08-16 배포) 따라서 `null` 은 "기수 없음" 이 아니라 조회 실패를 뜻한다.
 *
 * 모집 개폐는 `status` 가 아니라 `ctaStatus` 로 판정한다 — DDD_BE#68 이후로는
 * status 가 RECRUITING 이어도 모집 기간 밖이면 PRE_NOTIFICATION / CLOSED 가 오고,
 * 이때 파트 상세는 404, 지원서 제출은 400 COHORT_PART_CLOSED 가 난다.
 *
 * 기수를 못 읽으면(조회 실패 / 활성 기수 없음) "preNotification" 으로 떨어진다.
 * "closed" 는 이제 [모집 종료] 비활성 CTA 라서, 여기로 떨어지면 사전 알림 동선까지
 * 같이 막힌다. 반면 사전 알림은 활성 기수가 없어도 general 신청으로 처리되므로
 * 안전하다. 어느 쪽으로 떨어지든 지원서는 ctaStatus 가 APPLY 일 때만 열린다.
 */
export function parseRecruitStatus(cohort: PublicCohortDto | null | undefined): RecruitStatus {
  if (!cohort?.hasActiveCohort) return "preNotification";
  return (cohort.ctaStatus && RECRUIT_STATUS_BY_CTA[cohort.ctaStatus]) || "preNotification";
}

export function getActiveCohortId(cohort: PublicCohortDto | null | undefined): number | null {
  return cohort?.id ?? null;
}

/**
 * 사전 알림 문구에 붙일 기수 명칭("14기") — 모집 예정 기수가 있을 때만 값이 있다.
 *
 * 모집 예정 기수가 없으면(활성 기수 없음 / 조회 실패) null 이고, 호출부는 기수 번호
 * 없는 문구로 떨어진다. 어드민에 모집 예정 기수가 없는데도 홈페이지 사전 알림 팝업이
 * "14기" 로 안내하던 문제가 문구를 하드코딩했기 때문이라, 기수 노출의 단일 기준을
 * 활성 기수 응답으로 옮긴다.
 *
 * `ctaStatus` 가 PRE_NOTIFICATION 인 경우만 통과시킨다 — 모집 중/종료 기수는 사전 알림
 * 대상이 아니고, 그 상태에서는 CTA 가 지원서/[모집 종료] 라 이 문구가 쓰이지 않는다.
 * 기수명은 어드민 입력값 그대로다(`buildName` 이 "16" → "16기" 로 저장).
 */
export function getPreNotificationCohortName(
  cohort: PublicCohortDto | null | undefined,
): string | null {
  if (!cohort?.hasActiveCohort) return null;
  if (cohort.ctaStatus !== "PRE_NOTIFICATION") return null;
  const name = cohort.name?.trim();
  return name ? name : null;
}

export function getActiveCohortPartId(cohort: PublicCohortDto | null | undefined): number | null {
  const parts = cohort?.parts ?? [];
  const opened = parts.find((p) => p.isOpen && typeof p.id === "number");
  if (opened?.id != null) return opened.id;
  const first = parts.find((p) => typeof p.id === "number");
  return first?.id ?? null;
}

/** BE partName enum → 웹에서 노출하는 ApplyPartOption */
const PART_NAME_TO_APPLY: Record<CohortPartName, ApplyPartOption> = {
  IOS: "iOS",
  AND: "AOS",
  FE: "FE",
  BE: "BE",
  PM: "PM",
  PD: "PD",
};

/**
 * 활성 기수 응답 → 지원서에서 선택 가능한 파트 목록.
 *
 * `isOpen` 이 명시적으로 false 인 파트만 제외한다. BE 가 공개 응답에서 플래그를
 * 생략하더라도 파트 전체가 사라져 지원 자체가 막히는 상황을 만들지 않기 위함이다.
 */
export function buildApplyParts(cohort: PublicCohortDto | null | undefined): ApplyPart[] {
  const cohortPartIdByOption = new Map<ApplyPartOption, number>();
  const parts: PublicCohortPart[] = cohort?.parts ?? [];
  for (const part of parts) {
    if (part.isOpen === false) continue;
    if (typeof part.id !== "number") continue;
    const option = PART_NAME_TO_APPLY[part.partName];
    if (!option) continue;
    cohortPartIdByOption.set(option, part.id);
  }

  return APPLY_PART_OPTIONS.flatMap((option) => {
    const cohortPartId = cohortPartIdByOption.get(option);
    return cohortPartId === undefined ? [] : [{ option, cohortPartId }];
  });
}

/**
 * 지원서 질문 1건 — `key` 가 제출 시 answers 의 키가 된다.
 *
 * `type` 은 입력 UI 를 고르는 힌트다. `"file"` 이면 answers 값이 문자열이 아니라
 * 업로드 응답 객체(`ApplicationAttachmentDto`)가 된다.
 */
export type ApplyQuestion = {
  key: string;
  label: string;
  required: boolean;
  type: ApplicationQuestionType;
};

/**
 * 파트 상세 응답 → 지원서에 렌더할 질문 목록.
 *
 * `key` 는 어드민이 편집할 수 없고 label 을 slugify 한 값이 자동 저장된다(한글 라벨이면
 * 한글 key). 제출 시 answers 의 키는 반드시 이 값이어야 하므로 프론트에서 가공하지 않는다.
 *
 * `type` 은 PDF 첨부 도입(2026-08-16) 이후 추가된 필드다. 그 전에 저장된 질문에는
 * 없으므로 `"file"` 이 아닌 값은 모두 서술형으로 본다.
 */
export function buildApplyQuestions(
  part: PublicCohortPartDetail | null | undefined,
): ApplyQuestion[] {
  const questions = part?.applicationSchema?.questions ?? [];
  return questions.flatMap((question) => {
    if (typeof question?.key !== "string" || question.key.length === 0) return [];
    const label =
      typeof question.label === "string" && question.label.length > 0
        ? question.label
        : question.key;
    return [
      {
        key: question.key,
        label,
        required: question.required === true,
        type: question.type === "file" ? "file" : "text",
      },
    ];
  });
}
