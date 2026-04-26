import type {
  CreateCohortRequestDto,
  UpdateCohortRequestDto,
  UpdateCohortPartsRequestDto,
  CohortPartConfigDto,
  CohortPartConfigDtoName,
  CreateCohortRequestDtoStatus,
  UpdateCohortRequestDtoStatus,
} from "../generated/dddApi.schemas";

// POST /api/v1/cohorts - 기수 생성
export type PostCreateCohortRequest = CreateCohortRequestDto;
export type PostCreateCohortResponse = CohortDto;

// GET /api/v1/cohorts - 기수 목록 조회
export type GetCohortsResponse = CohortDto[];

// GET /api/v1/cohorts/{id} - 기수 단일 조회
export type GetCohortParams = { id: number };
export type GetCohortResponse = CohortDto;

// PUT /api/v1/cohorts/{id} - 기수 수정
export type PutUpdateCohortParams = { id: number };
export type PutUpdateCohortRequest = UpdateCohortRequestDto;
export type PutUpdateCohortResponse = CohortDto;

// DELETE /api/v1/cohorts/{id} - 기수 삭제
export type DeleteCohortParams = { id: number };
export type DeleteCohortResponse = void;

// PUT /api/v1/cohorts/{id}/parts - 기수 파트 설정 수정
export type PutUpdateCohortPartsParams = { id: number };
export type PutUpdateCohortPartsRequest = UpdateCohortPartsRequestDto;
export type PutUpdateCohortPartsResponse = CohortDto;

// 엔티티 타입
export type CohortPartConfig = CohortPartConfigDto;
export type CohortStatus = CreateCohortRequestDtoStatus;
export type CohortPartName = CohortPartConfigDtoName;
export type UpdateCohortStatus = UpdateCohortRequestDtoStatus;

export interface CohortDto {
  id: number;
  name: string;
  recruitStartAt: string;
  recruitEndAt: string;
  status: CohortStatus;
  process?: Record<string, unknown>;
  curriculum?: Record<string, unknown>[];
  applicationForm?: Record<string, unknown>;
  parts?: CohortPartConfig[];
  createdAt: string;
  updatedAt: string;
}
