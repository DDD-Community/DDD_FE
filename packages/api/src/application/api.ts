import { getApiClient } from "../client";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationsResponse,
  GetAdminApplicationParams,
  GetAdminApplicationResponse,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PatchApplicationStatusResponse,
  PostSaveApplicationDraftRequest,
  PostSaveApplicationDraftResponse,
  PostSubmitApplicationRequest,
  PostSubmitApplicationResponse,
  GetMyApplicationResponse,
} from "./types";

const APPLICATION_BASE_URL = "/api/v1/application" as const;

export const applicationAPI = {
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.cohortId !== undefined)
      searchParams.set("cohortId", String(params.cohortId));
    if (params.cohortPartId !== undefined)
      searchParams.set("cohortPartId", String(params.cohortPartId));
    if (params.status !== undefined) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return getApiClient().get<GetAdminApplicationsResponse>(
      `${APPLICATION_BASE_URL}/admin${query ? `?${query}` : ""}`,
    );
  },

  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    getApiClient().get<GetAdminApplicationResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}`,
    ),

  patchApplicationStatus: ({
    params,
    payload,
  }: {
    params: PatchApplicationStatusParams;
    payload: PatchApplicationStatusRequest;
  }) =>
    getApiClient().patch<PatchApplicationStatusResponse>(
      `${APPLICATION_BASE_URL}/admin/${params.id}/status`,
      payload,
    ),

  saveApplicationDraft: ({
    payload,
  }: {
    payload: PostSaveApplicationDraftRequest;
  }) =>
    getApiClient().post<PostSaveApplicationDraftResponse>(
      `${APPLICATION_BASE_URL}/draft`,
      payload,
    ),

  submitApplication: ({
    payload,
  }: {
    payload: PostSubmitApplicationRequest;
  }) =>
    getApiClient().post<PostSubmitApplicationResponse>(
      `${APPLICATION_BASE_URL}/submit`,
      payload,
    ),

  getMyApplication: () =>
    getApiClient().get<GetMyApplicationResponse>(`${APPLICATION_BASE_URL}/my`),
};
