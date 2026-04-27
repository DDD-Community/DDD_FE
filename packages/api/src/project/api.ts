import { getApiClient } from "../client";
import type {
  GetProjectsParams,
  GetProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
  PostCreateProjectRequest,
  PostCreateProjectResponse,
  PutUpdateProjectParams,
  PutUpdateProjectRequest,
  PutUpdateProjectResponse,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
  PutUpdateProjectMembersResponse,
} from "./types";

const PROJECT_BASE_URL = "/api/v1/project" as const;

export const projectAPI = {
  getProjects: ({ params }: { params: GetProjectsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.platform !== undefined)
      searchParams.set("platform", params.platform);
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return getApiClient().get<GetProjectsResponse>(
      `${PROJECT_BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getProject: ({ params }: { params: GetProjectParams }) =>
    getApiClient().get<GetProjectResponse>(`${PROJECT_BASE_URL}/${params.id}`),

  createProject: ({ payload }: { payload: PostCreateProjectRequest }) =>
    getApiClient().post<PostCreateProjectResponse>(
      `${PROJECT_BASE_URL}/admin`,
      payload,
    ),

  updateProject: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectParams;
    payload: PutUpdateProjectRequest;
  }) =>
    getApiClient().put<PutUpdateProjectResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}`,
      payload,
    ),

  deleteProject: ({ params }: { params: DeleteProjectParams }) =>
    getApiClient().delete<void>(`${PROJECT_BASE_URL}/admin/${params.id}`),

  updateProjectMembers: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectMembersParams;
    payload: PutUpdateProjectMembersRequest;
  }) =>
    getApiClient().put<PutUpdateProjectMembersResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}/members`,
      payload,
    ),
};
