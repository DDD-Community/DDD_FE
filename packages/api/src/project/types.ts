import type { components, paths } from "../generated/api";

// Request DTO
export type CreateProjectRequestDto = components["schemas"]["CreateProjectRequestDto"];
export type UpdateProjectRequestDto = components["schemas"]["UpdateProjectRequestDto"];
export type UpdateProjectMembersRequestDto =
  components["schemas"]["UpdateProjectMembersRequestDto"];
export type ProjectMemberRequestDto = components["schemas"]["ProjectMemberRequestDto"];

// GET /api/v1/projects - 공개 목록 조회
export type GetProjectsParams =
  paths["/api/v1/projects"]["get"]["parameters"]["query"];
export type GetProjectsResponse = ProjectListDto;
export type GetInfiniteProjectsParams = Omit<NonNullable<GetProjectsParams>, "cursor">;

// GET /api/v1/projects/{id} - 공개 단건
export type GetProjectParams = { id: number };
export type GetProjectResponse = ProjectDto;

// GET /api/v1/admin/projects - 어드민 전체 목록 (BE 는 envelope 없이 배열을 반환)
export type GetAdminProjectsResponse = ProjectDto[];

// GET /api/v1/admin/projects/{id} - 어드민 단건
export type GetAdminProjectParams = { id: number };
export type GetAdminProjectResponse = ProjectDto;

// POST /api/v1/admin/projects - 어드민 생성
export type PostCreateProjectRequest = CreateProjectRequestDto;
export type PostCreateProjectResponse = ProjectDto;

// PATCH /api/v1/admin/projects/{id} - 어드민 수정
export type PatchUpdateProjectParams = { id: number };
export type PatchUpdateProjectRequest = UpdateProjectRequestDto;
export type PatchUpdateProjectResponse = ProjectDto;

// 하위 호환: 기존 PutUpdateProject* alias
/** @deprecated PatchUpdateProjectParams 을 사용하세요 */
export type PutUpdateProjectParams = PatchUpdateProjectParams;
/** @deprecated PatchUpdateProjectRequest 을 사용하세요 */
export type PutUpdateProjectRequest = PatchUpdateProjectRequest;
/** @deprecated PatchUpdateProjectResponse 을 사용하세요 */
export type PutUpdateProjectResponse = PatchUpdateProjectResponse;

// DELETE /api/v1/admin/projects/{id} - 어드민 삭제
export type DeleteProjectParams = { id: number };
export type DeleteProjectResponse = void;

// PUT /api/v1/admin/projects/{id}/members - 어드민 멤버 수정
export type PutUpdateProjectMembersParams = { id: number };
export type PutUpdateProjectMembersRequest = UpdateProjectMembersRequestDto;
export type PutUpdateProjectMembersResponse = ProjectDto;

// POST /api/v1/admin/projects/{id}/pdf · /thumbnail - 파일 업로드 + 프로젝트 연결
// multipart 필드명은 `file` 하나. 응답은 갱신된 프로젝트 전체다.
export type PostUploadProjectAssetParams = { id: number };
export type PostUploadProjectAssetRequest = { file: File };
export type PostUploadProjectAssetResponse = ProjectDto;

// 엔티티 타입 (BE 응답 schema 미정의 → 수동 정의)
export type ProjectPlatform =
  NonNullable<GetProjectsParams>["platform"] extends infer P
    ? P extends string
      ? P
      : never
    : never;
export type ProjectCreatePlatform = CreateProjectRequestDto["platforms"][number];
export type ProjectUpdatePlatform = NonNullable<
  UpdateProjectRequestDto["platforms"]
>[number];
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
