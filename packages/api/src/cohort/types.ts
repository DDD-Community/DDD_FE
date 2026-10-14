import type { components } from "../generated/api";

// ---------- Runtime enum (consumers reference *.PM, *.UPCOMING 등) ----------
//
// 파트명은 generated `CohortPartName` 이 단일 출처다. 아래 런타임 객체는 값 참조용
// 이며 `satisfies` 로 묶어, BE 가 파트를 추가·삭제하면 빌드에서 잡히게 한다.
export const CohortPartConfigDtoName = {
  PM: "PM",
  PD: "PD",
  BE: "BE",
  FE: "FE",
  IOS: "IOS",
  AND: "AND",
} as const satisfies Record<
  components["schemas"]["CohortPartName"],
  components["schemas"]["CohortPartName"]
>;
export type CohortPartConfigDtoName = components["schemas"]["CohortPartName"];

export const CreateCohortRequestDtoStatus = {
  UPCOMING: "UPCOMING",
  RECRUITING: "RECRUITING",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;
export type CreateCohortRequestDtoStatus =
  (typeof CreateCohortRequestDtoStatus)[keyof typeof CreateCohortRequestDtoStatus];

// UpdateCohortRequestDtoStatus 는 Create 와 동일 값이지만 별도 타입 노출 (기존 호환)
export type UpdateCohortRequestDtoStatus = CreateCohortRequestDtoStatus;

// ---------- 엔티티 타입 ----------
//
// 퍼블릭 응답(/cohorts/active, /cohorts/parts/{id})은 2026-08-16 BE 배포로
// OpenAPI 에 노출되어 아래 PublicCohortDto / PublicCohortPartDetail 이 generated
// 스키마를 직접 참조한다. 어드민 응답은 아직 schema 미정의라 CohortDto 를 수동
// 정의한 채로 두고, generated payload 타입과 충돌하는 부분만 cohort/api.ts 에서
// `as never` cast 로 우회한다.
//
export type CohortStatus = CreateCohortRequestDtoStatus;
export type CohortPartName = components["schemas"]["CohortPartName"];
export type UpdateCohortStatus = UpdateCohortRequestDtoStatus;

export interface CohortPartConfigDto {
  id?: number;
  partName: CohortPartName;
  isOpen: boolean;
  applicationSchema: Record<string, unknown>;
}

/** 기존 호환 alias (FE 내부에서 이 이름으로 참조 중) */
export type CohortPartConfig = CohortPartConfigDto;

// ---------- Request DTO (process/curriculum/parts 형태를 실제 사용에 맞게 완화) ----------
export type CreateCohortRequestDto = Omit<
  components["schemas"]["CreateCohortRequestDto"],
  "process" | "curriculum" | "applicationForm" | "parts"
> & {
  process?: Record<string, unknown>;
  curriculum?: Record<string, unknown>[];
  applicationForm?: Record<string, unknown>;
  parts?: CohortPartConfigDto[];
};

export type UpdateCohortRequestDto = Omit<
  components["schemas"]["UpdateCohortRequestDto"],
  "process" | "curriculum" | "applicationForm"
> & {
  process?: Record<string, unknown>;
  curriculum?: Record<string, unknown>[];
  applicationForm?: Record<string, unknown>;
};

// PUT /admin/cohorts/{id}/parts 요청 파트 shape 은 응답과 필드명이 다르다:
// 요청은 OpenAPI 스키마대로 `{ name, isOpen, formSchema }`,
// 응답은 `{ partName, isOpen, applicationSchema }` (위 CohortPartConfigDto).
// 응답 기준으로 serialize 하면 BE 가 `name`/`formSchema` 를 못 읽어 검증 실패한다.
export interface UpdateCohortPartConfig {
  name: CohortPartName;
  isOpen: boolean;
  formSchema: Record<string, unknown>;
}

export type UpdateCohortPartsRequestDto = {
  parts: UpdateCohortPartConfig[];
};

// ---------- 엔드포인트 시그니처 ----------

// POST /api/v1/admin/cohorts - 기수 생성
export type PostCreateCohortRequest = CreateCohortRequestDto;
export type PostCreateCohortResponse = CohortDto;

// GET /api/v1/admin/cohorts - 기수 목록 조회
export type GetCohortsResponse = CohortDto[];

// GET /api/v1/admin/cohorts/{id} - 기수 단건 조회
export type GetCohortParams = { id: number };
export type GetCohortResponse = CohortDto;

// PATCH /api/v1/admin/cohorts/{id} - 기수 정보 및 상태 수정
export type PatchUpdateCohortParams = { id: number };
export type PatchUpdateCohortRequest = UpdateCohortRequestDto;
export type PatchUpdateCohortResponse = CohortDto;

// 커리큘럼 저장 후 출석앱 일정 동기화 결과 (기수 생성·수정 응답의 attendanceSync)
export type AttendanceSyncResult = components["schemas"]["AttendanceSyncResultResponseDto"];

// DELETE /api/v1/admin/cohorts/{id} - 기수 삭제
export type DeleteCohortParams = { id: number };
export type DeleteCohortResponse = void;

// PUT /api/v1/admin/cohorts/{id}/parts - 기수 파트 모집 설정
export type PutUpdateCohortPartsParams = { id: number };
export type PutUpdateCohortPartsRequest = UpdateCohortPartsRequestDto;
export type PutUpdateCohortPartsResponse = CohortDto;

// ---------- 지원서 양식 (applicationSchema) ----------
//
// generated 타입은 `applicationSchema: { [key: string]: unknown }` 이라 questions
// 를 그대로 쓸 수 없다. BE 계약(key/label/required/type)에 맞춰 여기서 좁힌다.

/**
 * 질문 입력 유형.
 *
 * `formSchema` 는 자유 형식(jsonb)이고 BE 는 `required` 만 검사한다 — 즉 `type` 은
 * 순수 FE 렌더 힌트다. `type` 이 없는 기존 질문은 `"text"` 로 본다.
 *
 * - `text` — answers 값이 문자열
 * - `file` — answers 값이 `ApplicationAttachmentDto` (PDF 업로드 응답 객체)
 */
export const APPLICATION_QUESTION_TYPES = ["text", "file"] as const;
export type ApplicationQuestionType = (typeof APPLICATION_QUESTION_TYPES)[number];

export interface ApplicationQuestion {
  key: string;
  label: string;
  required: boolean;
  type?: ApplicationQuestionType;
}

export interface ApplicationSchema {
  questions?: ApplicationQuestion[];
}

// ---------- 퍼블릭 응답 (어드민 CohortDto 와 별개) ----------
//
// 공개 응답의 parts[] 에는 applicationSchema 가 없고, 활성 기수가 없으면 404 가
// 아니라 200 + hasActiveCohort:false 로 내려온다. 어드민 CohortDto 를 재사용하면
// parts[].applicationSchema 접근이 타입 통과 후 런타임에 터지므로 분리한다.
//
// process/curriculum 은 BE 가 자유 JSON 으로 내려 generated 상 `Record<string, never>`
// (= 어떤 키도 읽을 수 없음) 로 잡히므로 실사용 형태로 완화한다.
export type PublicCohortPart = components["schemas"]["PublicCohortPartSummaryDto"];

export type PublicCohortCtaStatus = components["schemas"]["PublicCohortResponseDto"]["ctaStatus"];

export type PublicCohortDto = Omit<
  components["schemas"]["PublicCohortResponseDto"],
  "process" | "curriculum"
> & {
  process?: Record<string, unknown> | null;
  curriculum?: Record<string, unknown>[] | null;
};

// GET /api/v1/cohorts/active - 현재 활성 기수 조회 (public)
export type GetActiveCohortResponse = PublicCohortDto;

// GET /api/v1/cohorts/parts/{id} - 모집 파트 상세 조회 (public)
export type GetCohortPartParams = { id: number };
export type PublicCohortPartDetail = Omit<
  components["schemas"]["PublicCohortPartResponseDto"],
  "applicationSchema"
> & { applicationSchema: ApplicationSchema };
export type GetCohortPartResponse = PublicCohortPartDetail;

// ---------- CohortDto 엔티티 (BE 응답 schema 미정의 → 수동 정의) ----------
export interface CohortDto {
  id: number;
  name: string;
  recruitStartAt: string;
  recruitEndAt: string;
  status: CohortStatus;
  process?: Record<string, unknown>;
  curriculum?: Record<string, unknown>[];
  applicationForm?: Record<string, unknown>;
  parts?: CohortPartConfigDto[];
  attendanceSync: components["schemas"]["AttendanceSyncResultResponseDto"] | null;
  createdAt: string;
  updatedAt: string;
}
