import type {
  UpdateApplicationStatusRequestDto,
  SaveApplicationDraftRequestDto,
  SubmitApplicationRequestDto,
  ApplicationGetAdminListParams,
  ApplicationGetAdminListStatus,
  UpdateApplicationStatusRequestDtoStatus,
} from "../generated/dddApi.schemas";

// GET /api/v1/application/admin - 어드민 지원서 목록 조회
export type GetAdminApplicationsParams = ApplicationGetAdminListParams;
export type GetAdminApplicationsResponse = ApplicationDto[];

// GET /api/v1/application/admin/{id} - 어드민 지원서 단일 조회
export type GetAdminApplicationParams = { id: number };
export type GetAdminApplicationResponse = ApplicationDto;

// PATCH /api/v1/application/admin/{id}/status - 지원서 상태 변경
export type PatchApplicationStatusParams = { id: number };
export type PatchApplicationStatusRequest = UpdateApplicationStatusRequestDto;
export type PatchApplicationStatusResponse = ApplicationDto;

// POST /api/v1/application/draft - 지원서 임시 저장
export type PostSaveApplicationDraftRequest = SaveApplicationDraftRequestDto;
export type PostSaveApplicationDraftResponse = ApplicationDto;

// POST /api/v1/application/submit - 지원서 제출
export type PostSubmitApplicationRequest = SubmitApplicationRequestDto;
export type PostSubmitApplicationResponse = ApplicationDto;

// GET /api/v1/application/my - 내 지원서 조회
export type GetMyApplicationResponse = ApplicationDto;

// 엔티티 타입
export type ApplicationStatus = ApplicationGetAdminListStatus;
export type ApplicationStatusUpdate = UpdateApplicationStatusRequestDtoStatus;

export interface ApplicationDto {
  id: number;
  cohortId: number;
  cohortPartId: number;
  applicantName: string;
  applicantPhone?: string;
  applicantBirthDate?: string;
  applicantRegion?: string;
  answers: Record<string, unknown>;
  status: ApplicationStatus;
  privacyAgreed?: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
