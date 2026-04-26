import type {
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  UpdateProjectMembersRequestDto,
  ProjectMemberRequestDto,
  ProjectGetPublicListParams,
  ProjectGetPublicListPlatform,
  CreateProjectRequestDtoPlatformsItem,
  UpdateProjectRequestDtoPlatformsItem,
} from "../generated/dddApi.schemas";

// GET /api/v1/project - 프로젝트 공개 목록 조회
export type GetProjectsParams = ProjectGetPublicListParams;
export type GetProjectsResponse = ProjectListDto;

// GET /api/v1/project/{id} - 프로젝트 단일 조회
export type GetProjectParams = { id: number };
export type GetProjectResponse = ProjectDto;

// POST /api/v1/project/admin - 프로젝트 생성 (어드민)
export type PostCreateProjectRequest = CreateProjectRequestDto;
export type PostCreateProjectResponse = ProjectDto;

// PUT /api/v1/project/admin/{id} - 프로젝트 수정 (어드민)
export type PutUpdateProjectParams = { id: number };
export type PutUpdateProjectRequest = UpdateProjectRequestDto;
export type PutUpdateProjectResponse = ProjectDto;

// DELETE /api/v1/project/admin/{id} - 프로젝트 삭제 (어드민)
export type DeleteProjectParams = { id: number };
export type DeleteProjectResponse = void;

// PUT /api/v1/project/admin/{id}/members - 프로젝트 참여자 수정 (어드민)
export type PutUpdateProjectMembersParams = { id: number };
export type PutUpdateProjectMembersRequest = UpdateProjectMembersRequestDto;
export type PutUpdateProjectMembersResponse = ProjectDto;

// 엔티티 타입
export type ProjectPlatform = ProjectGetPublicListPlatform;
export type ProjectCreatePlatform = CreateProjectRequestDtoPlatformsItem;
export type ProjectUpdatePlatform = UpdateProjectRequestDtoPlatformsItem;
export type ProjectMember = ProjectMemberRequestDto;

export interface ProjectDto {
  id: number;
  cohortId: number;
  platforms: ProjectPlatform[];
  name: string;
  description: string;
  thumbnailUrl?: string;
  pdfUrl?: string;
  members?: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListDto {
  items: ProjectDto[];
  nextCursor?: string;
  hasMore: boolean;
}
