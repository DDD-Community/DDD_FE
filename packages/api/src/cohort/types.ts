import type {
  CreateCohortRequestDto,
  UpdateCohortRequestDto,
  UpdateCohortPartsRequestDto,
  CohortPartConfigDto,
  CohortPartConfigDtoName,
  CreateCohortRequestDtoStatus,
  UpdateCohortRequestDtoStatus,
} from "../generated/dddApi.schemas";

export { CohortPartConfigDtoName } from "../generated/dddApi.schemas";
export { CreateCohortRequestDtoStatus } from "../generated/dddApi.schemas";
export type {
  CreateCohortRequestDto,
  UpdateCohortRequestDto,
  UpdateCohortPartsRequestDto,
  CohortPartConfigDto,
} from "../generated/dddApi.schemas";

// POST /api/v1/admin/cohorts - 기수 생성
export type PostCreateCohortRequest = CreateCohortRequestDto;
export type PostCreateCohortResponse = CohortDto;

// GET /api/v1/admin/cohorts - 기수 목록 조회
export type GetCohortsResponse = CohortDto[];

// GET /api/v1/admin/cohorts/{id} - 기수 단건 조회
export type GetCohortParams = { id: number };
export type GetCohortResponse = CohortDto;

// PATCH /api/v1/admin/cohorts/{id} - 기수 정보 및 상태 수정 (PUT → PATCH)
export type PatchUpdateCohortParams = { id: number };
export type PatchUpdateCohortRequest = UpdateCohortRequestDto;
export type PatchUpdateCohortResponse = CohortDto;

// DELETE /api/v1/admin/cohorts/{id} - 기수 삭제
export type DeleteCohortParams = { id: number };
export type DeleteCohortResponse = void;

// PUT /api/v1/admin/cohorts/{id}/parts - 기수 파트 모집 설정
export type PutUpdateCohortPartsParams = { id: number };
export type PutUpdateCohortPartsRequest = UpdateCohortPartsRequestDto;
export type PutUpdateCohortPartsResponse = CohortDto;

// GET /api/v1/cohorts/active - 현재 활성 기수 조회 (public)
export type GetActiveCohortResponse = CohortDto;

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
