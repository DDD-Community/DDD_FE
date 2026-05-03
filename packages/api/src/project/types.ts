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

// GET /api/v1/projects - 프로젝트 공개 목록 조회
export type GetProjectsParams = ProjectGetPublicListParams;
export type GetProjectsResponse = ProjectListDto;

// 무한 스크롤용 파라미터 (cursor는 useInfiniteQuery의 pageParam이 관리)
export type GetInfiniteProjectsParams = Omit<GetProjectsParams, "cursor">;

// GET /api/v1/projects/{id} - 프로젝트 단일 조회
export type GetProjectParams = { id: number };
export type GetProjectResponse = ProjectDto;

// GET /api/v1/admin/projects - 어드민 프로젝트 전체 목록 조회
export type GetAdminProjectsResponse = ProjectListDto;

// GET /api/v1/admin/projects/{id} - 어드민 프로젝트 단건 조회
export type GetAdminProjectParams = { id: number };
export type GetAdminProjectResponse = ProjectDto;

// POST /api/v1/admin/projects - 프로젝트 생성 (어드민)
export type PostCreateProjectRequest = CreateProjectRequestDto;
export type PostCreateProjectResponse = ProjectDto;

// PATCH /api/v1/admin/projects/{id} - 프로젝트 수정 (어드민)
export type PatchUpdateProjectParams = { id: number };
export type PatchUpdateProjectRequest = UpdateProjectRequestDto;
export type PatchUpdateProjectResponse = ProjectDto;

// 하위 호환: 기존 PutUpdateProject* alias (어드민 호출처가 아직 참조 중)
/** @deprecated PatchUpdateProjectParams 을 사용하세요 */
export type PutUpdateProjectParams = PatchUpdateProjectParams;
/** @deprecated PatchUpdateProjectRequest 을 사용하세요 */
export type PutUpdateProjectRequest = PatchUpdateProjectRequest;
/** @deprecated PatchUpdateProjectResponse 을 사용하세요 */
export type PutUpdateProjectResponse = PatchUpdateProjectResponse;

// DELETE /api/v1/admin/projects/{id} - 프로젝트 삭제 (어드민)
export type DeleteProjectParams = { id: number };
export type DeleteProjectResponse = void;

// PUT /api/v1/admin/projects/{id}/members - 프로젝트 참여자 수정 (어드민)
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
