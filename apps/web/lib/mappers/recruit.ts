import type { PublicCohortDto } from "@ddd/api";
import { findCurriculumDescription, normalizeCurriculumKey } from "@/constants/recruit";

/** 모집 일정 카드 1건 — 배열 순서가 곧 화면의 01~04 스텝 순서다. */
export type RecruitScheduleItem = {
  step: string;
  label: string;
  /** 시작일. 단일 날짜 일정이면 이 값만 채워진다. */
  date: string;
  /** 기간 일정의 종료일. 모바일에서 이 값만 다음 줄로 내려 표기한다. */
  dateEnd?: string;
};

/**
 * 커리큘럼 카드 1건 — 어드민은 주차별로 { date, description } 만 입력받으므로
 * 어드민의 description 이 카드 제목이 되고, 설명 문구는 활동명으로 매칭해 붙인다.
 */
export type RecruitCurriculumItem = {
  week: string;
  date: string;
  title: string;
  description: string;
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DateParts = { year: string; month: string; day: string; weekday: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * BE 는 모집 기간을 UTC 자정 date-time ("2026-08-29T00:00:00.000Z") 으로,
 * process/curriculum 날짜를 plain date ("2026-09-07") 로 내려준다. 두 형태 모두
 * 앞 10자리가 곧 화면에 표기할 날짜이므로 로컬 타임존 해석을 거치지 않고 UTC 로만
 * 파싱한다 — 서버 타임존이 KST 가 아닐 때 하루가 밀리는 것을 막기 위함이다.
 */
function parseDateParts(value: unknown): DateParts | null {
  if (typeof value !== "string") return null;
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!matched) return null;

  const [, year, month, day] = matched;
  const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  // Date.UTC 는 2026-13-45 같은 값을 NaN 대신 다음 달로 굴려버리므로 왕복 검증한다.
  if (utc.getUTCMonth() !== Number(month) - 1 || utc.getUTCDate() !== Number(day)) return null;

  return { year, month, day, weekday: WEEKDAY_LABELS[utc.getUTCDay()] };
}

/** "2026.09.14" / "2026.09.14 (월)" */
function formatSingleDate(value: unknown, options?: { withWeekday: boolean }): string | null {
  const parts = parseDateParts(value);
  if (!parts) return null;

  const base = `${parts.year}.${parts.month}.${parts.day}`;
  return options?.withWeekday ? `${base} (${parts.weekday})` : base;
}

/**
 * "2026.08.29 (토)" + "09.05 (토)" — 종료일은 연도를 반복하지 않는다.
 * 화면에서 시작일/종료일을 각각 한 줄로 끊어야 하므로 합치지 않고 나눠서 돌려준다.
 */
function formatDateRange(start: unknown, end: unknown): { date: string; dateEnd: string } | null {
  const startParts = parseDateParts(start);
  const endParts = parseDateParts(end);
  if (!startParts || !endParts) return null;

  return {
    date: `${startParts.year}.${startParts.month}.${startParts.day} (${startParts.weekday})`,
    dateEnd: `${endParts.month}.${endParts.day} (${endParts.weekday})`,
  };
}

/**
 * 활성 기수 응답 → 모집 일정 카드 목록.
 *
 * 날짜가 비어 있는 단계는 카드에서 제외하고, 남은 카드에만 01 부터 스텝 번호를
 * 다시 매긴다. 운영진이 아직 입력하지 않은 일정을 빈 칸으로 노출하지 않기 위함이다.
 */
export function buildRecruitSchedules(
  cohort: PublicCohortDto | null | undefined,
): RecruitScheduleItem[] {
  if (!cohort) return [];

  const process = isRecord(cohort.process) ? cohort.process : {};
  const documentRange = formatDateRange(cohort.recruitStartAt, cohort.recruitEndAt);
  const interviewRange = formatDateRange(process.interviewStartDate, process.interviewEndDate);

  const stages: Array<{ label: string; date: string | null; dateEnd?: string }> = [
    { label: "서류 접수", date: documentRange?.date ?? null, dateEnd: documentRange?.dateEnd },
    { label: "서류 발표", date: formatSingleDate(process.documentResultDate) },
    {
      label: "온라인 인터뷰",
      date: interviewRange?.date ?? null,
      dateEnd: interviewRange?.dateEnd,
    },
    { label: "최종 발표", date: formatSingleDate(process.finalResultDate, { withWeekday: true }) },
  ];

  return stages
    .flatMap((stage) =>
      stage.date === null ? [] : [{ label: stage.label, date: stage.date, dateEnd: stage.dateEnd }],
    )
    .map((stage, index) => ({ step: String(index + 1).padStart(2, "0"), ...stage }));
}

/**
 * 활성 기수 응답 → 커리큘럼 카드 목록.
 *
 * 주차 번호는 원본 배열 인덱스를 따른다 — 중간 항목이 비어 제외되더라도 나머지
 * 주차 번호가 당겨지지 않도록 하기 위함이다.
 */
export function buildRecruitCurriculum(
  cohort: PublicCohortDto | null | undefined,
): RecruitCurriculumItem[] {
  const curriculum = Array.isArray(cohort?.curriculum) ? cohort.curriculum : [];
  // 같은 활동명이 두 번 등장하면(부스팅 데이 1·2회차) 설명이 달라지므로 등장 순번을 센다.
  const occurrenceByActivity = new Map<string, number>();

  return curriculum.flatMap((week, index) => {
    if (!isRecord(week)) return [];

    const title = typeof week.description === "string" ? week.description.trim() : "";
    const parts = parseDateParts(week.date);
    if (!title || !parts) return [];

    const key = normalizeCurriculumKey(title);
    const occurrence = occurrenceByActivity.get(key) ?? 0;
    occurrenceByActivity.set(key, occurrence + 1);

    return [
      {
        week: `${index + 1}주차`,
        date: `${parts.month}.${parts.day}`,
        title,
        description: findCurriculumDescription(title, occurrence),
      },
    ];
  });
}
