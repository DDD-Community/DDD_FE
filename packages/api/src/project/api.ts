import { api } from "../fetchClient";
import type {
  GetProjectsParams,
  GetProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
  GetAdminProjectsResponse,
  GetAdminProjectParams,
  GetAdminProjectResponse,
  PostCreateProjectRequest,
  PostCreateProjectResponse,
  PatchUpdateProjectParams,
  PatchUpdateProjectRequest,
  PatchUpdateProjectResponse,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
  PutUpdateProjectMembersResponse,
  PostUploadProjectAssetParams,
  PostUploadProjectAssetRequest,
  PostUploadProjectAssetResponse,
} from "./types";

type ProjectAssetPath =
  | "/api/v1/admin/projects/{id}/pdf"
  | "/api/v1/admin/projects/{id}/thumbnail";

/**
 * 파일 업로드와 프로젝트 연결을 서버가 한 요청으로 처리한다 (BE PR #100).
 *
 * 생성된 스펙(`generated/api.ts`)에 아직 두 경로가 없어 캐스트가 필요하다.
 * BE 배포 후 `pnpm gen:api` 로 갱신하면 경로 캐스트를 걷어낸다.
 * 런타임은 openapi-fetch 가 FormData 를 감지해 multipart 로 그대로 전송한다.
 */
function uploadProjectAsset(
  path: ProjectAssetPath,
  { params, payload }: {
    params: PostUploadProjectAssetParams;
    payload: PostUploadProjectAssetRequest;
  },
): Promise<PostUploadProjectAssetResponse> {
  const formData = new FormData();
  formData.append("file", payload.file);

  return api.post(path as never, {
    params: { path: { id: params.id } },
    body: formData,
  } as never) as unknown as Promise<PostUploadProjectAssetResponse>;
}

export const projectAPI = {
  /** 공개 프로젝트 목록 (cursor 페이지네이션) - GET /api/v1/projects */
  getProjects: ({ params }: { params: GetProjectsParams }) =>
    api.get("/api/v1/projects", {
      params: { query: params },
    }) as unknown as Promise<GetProjectsResponse>,

  /** 공개 프로젝트 단건 - GET /api/v1/projects/{id} */
  getProject: ({ params }: { params: GetProjectParams }) =>
    api.get("/api/v1/projects/{id}", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<GetProjectResponse>,

  /** 어드민 프로젝트 전체 목록 - GET /api/v1/admin/projects */
  getAdminProjects: () =>
    api.get("/api/v1/admin/projects") as unknown as Promise<GetAdminProjectsResponse>,

  /** 어드민 프로젝트 단건 - GET /api/v1/admin/projects/{id} */
  getAdminProject: ({ params }: { params: GetAdminProjectParams }) =>
    api.get("/api/v1/admin/projects/{id}", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<GetAdminProjectResponse>,

  /** 어드민 프로젝트 생성 - POST /api/v1/admin/projects */
  createProject: ({ payload }: { payload: PostCreateProjectRequest }) =>
    api.post("/api/v1/admin/projects", {
      body: payload,
    }) as unknown as Promise<PostCreateProjectResponse>,

  /** 어드민 프로젝트 수정 - PATCH /api/v1/admin/projects/{id} */
  updateProject: ({
    params,
    payload,
  }: {
    params: PatchUpdateProjectParams;
    payload: PatchUpdateProjectRequest;
  }) =>
    api.patch("/api/v1/admin/projects/{id}", {
      params: { path: { id: params.id } },
      body: payload,
    }) as unknown as Promise<PatchUpdateProjectResponse>,

  /** 어드민 프로젝트 삭제 - DELETE /api/v1/admin/projects/{id} */
  deleteProject: ({ params }: { params: DeleteProjectParams }) =>
    api.delete("/api/v1/admin/projects/{id}", {
      params: { path: { id: params.id } },
    }) as unknown as Promise<void>,

  /** 어드민 프로젝트 참여자 수정 - PUT /api/v1/admin/projects/{id}/members */
  updateProjectMembers: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectMembersParams;
    payload: PutUpdateProjectMembersRequest;
  }) =>
    api.put("/api/v1/admin/projects/{id}/members", {
      params: { path: { id: params.id } },
      body: payload,
    }) as unknown as Promise<PutUpdateProjectMembersResponse>,

  /** 어드민 프로젝트 PDF 업로드·연결 - POST /api/v1/admin/projects/{id}/pdf (최대 20MB) */
  uploadProjectPdf: (args: {
    params: PostUploadProjectAssetParams;
    payload: PostUploadProjectAssetRequest;
  }) => uploadProjectAsset("/api/v1/admin/projects/{id}/pdf", args),

  /** 어드민 프로젝트 썸네일 업로드·연결 - POST /api/v1/admin/projects/{id}/thumbnail (최대 5MB) */
  uploadProjectThumbnail: (args: {
    params: PostUploadProjectAssetParams;
    payload: PostUploadProjectAssetRequest;
  }) => uploadProjectAsset("/api/v1/admin/projects/{id}/thumbnail", args),
};
