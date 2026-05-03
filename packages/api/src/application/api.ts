import {
  applicationGetAdminList,
  applicationGetAdminById,
  applicationPatchAdminStatusById,
} from "../generated/admin-application/admin-application";
import {
  applicationSaveDraft,
  applicationGetDraftByPart,
  applicationSubmit,
} from "../generated/application/application";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationsResponse,
  GetAdminApplicationParams,
  GetAdminApplicationResponse,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PostSaveApplicationDraftRequest,
  GetApplicationDraftParams,
  PostSubmitApplicationRequest,
} from "./types";

export const applicationAPI = {
  /** 어드민 지원서 목록 조회 */
  getAdminApplications: ({ params }: { params: GetAdminApplicationsParams }) =>
    applicationGetAdminList(params) as unknown as Promise<GetAdminApplicationsResponse>,

  /** 어드민 지원서 단건 상세 조회 */
  getAdminApplication: ({ params }: { params: GetAdminApplicationParams }) =>
    applicationGetAdminById(params.id) as unknown as Promise<GetAdminApplicationResponse>,

  /** 어드민 지원서 상태 업데이트 */
  patchApplicationStatus: ({
    params,
    payload,
  }: {
    params: PatchApplicationStatusParams;
    payload: PatchApplicationStatusRequest;
  }) => applicationPatchAdminStatusById(params.id, payload),

  /** 지원서 임시저장 */
  saveApplicationDraft: ({
    payload,
  }: {
    payload: PostSaveApplicationDraftRequest;
  }) => applicationSaveDraft(payload),

  /** 임시저장 단건 조회 */
  getApplicationDraft: ({ params }: { params: GetApplicationDraftParams }) =>
    applicationGetDraftByPart(params.cohortPartId),

  /** 지원서 최종 제출 */
  submitApplication: ({
    payload,
  }: {
    payload: PostSubmitApplicationRequest;
  }) => applicationSubmit(payload),
};
