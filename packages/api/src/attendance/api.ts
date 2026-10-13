import { api } from "../fetchClient";
import type {
  DeleteAttendanceGenerationParams,
  DeleteAttendanceInvitationParams,
  DeleteAttendanceTeamParams,
  GetAttendanceBoardCsvParams,
  GetAttendanceBoardCsvResponse,
  GetAttendanceBoardParams,
  GetAttendanceBoardResponse,
  GetAttendanceGenerationsResponse,
  GetAttendanceInvitationsParams,
  GetAttendanceInvitationsResponse,
  GetAttendanceTeamsParams,
  GetAttendanceTeamsResponse,
  PostAttendanceGenerationRequest,
  PostAttendanceGenerationResponse,
  PostAttendanceInvitationParams,
  PostAttendanceInvitationRequest,
  PostAttendanceInvitationResponse,
  PostAttendanceTeamParams,
  PostAttendanceTeamRequest,
  PostAttendanceTeamResponse,
} from "./types";

export const attendanceAPI = {
  /** 출석 기수 목록 조회 - GET /api/v1/admin/attendance/generations */
  getGenerations: () =>
    api.get(
      "/api/v1/admin/attendance/generations",
    ) as unknown as Promise<GetAttendanceGenerationsResponse>,

  /** 출석 기수 생성 - POST /api/v1/admin/attendance/generations */
  createGeneration: ({ payload }: { payload: PostAttendanceGenerationRequest }) =>
    api.post("/api/v1/admin/attendance/generations", {
      body: payload,
    }) as unknown as Promise<PostAttendanceGenerationResponse>,

  /** 출석 기수 삭제 - DELETE /api/v1/admin/attendance/generations/{generationId} */
  deleteGeneration: ({ params }: { params: DeleteAttendanceGenerationParams }) =>
    api.delete("/api/v1/admin/attendance/generations/{generationId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  /** 출석 팀 목록 조회 - GET /api/v1/admin/attendance/generations/{generationId}/teams */
  getTeams: ({ params }: { params: GetAttendanceTeamsParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/teams", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceTeamsResponse>,

  /** 출석 팀 생성 - POST /api/v1/admin/attendance/generations/{generationId}/teams */
  createTeam: ({
    params,
    payload,
  }: {
    params: PostAttendanceTeamParams;
    payload: PostAttendanceTeamRequest;
  }) =>
    api.post("/api/v1/admin/attendance/generations/{generationId}/teams", {
      params: { path: params },
      body: payload,
    }) as unknown as Promise<PostAttendanceTeamResponse>,

  /** 출석 팀 삭제 - DELETE /api/v1/admin/attendance/teams/{teamId} */
  deleteTeam: ({ params }: { params: DeleteAttendanceTeamParams }) =>
    api.delete("/api/v1/admin/attendance/teams/{teamId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  /** 출석 초대코드 목록 조회 - GET /api/v1/admin/attendance/generations/{generationId}/invitations */
  getInvitations: ({ params }: { params: GetAttendanceInvitationsParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/invitations", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceInvitationsResponse>,

  /** 출석 초대코드 생성 - POST /api/v1/admin/attendance/generations/{generationId}/invitations */
  createInvitation: ({
    params,
    payload,
  }: {
    params: PostAttendanceInvitationParams;
    payload: PostAttendanceInvitationRequest;
  }) =>
    api.post("/api/v1/admin/attendance/generations/{generationId}/invitations", {
      params: { path: params },
      body: payload,
    }) as unknown as Promise<PostAttendanceInvitationResponse>,

  /** 출석 초대코드 삭제 - DELETE /api/v1/admin/attendance/invitations/{invitationId} */
  deleteInvitation: ({ params }: { params: DeleteAttendanceInvitationParams }) =>
    api.delete("/api/v1/admin/attendance/invitations/{invitationId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  /** 출석 보드 조회 - GET /api/v1/admin/attendance/generations/{generationId}/board */
  getBoard: ({ params }: { params: GetAttendanceBoardParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/board", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceBoardResponse>,

  /** 출석 보드 CSV 내보내기 - GET /api/v1/admin/attendance/generations/{generationId}/board/export */
  exportBoardCsv: ({ params }: { params: GetAttendanceBoardCsvParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/board/export", {
      params: { path: params },
      parseAs: "text",
    }) as unknown as Promise<GetAttendanceBoardCsvResponse>,
};
