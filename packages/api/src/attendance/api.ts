import { api } from "../fetchClient";
import type {
  AttendanceBoard,
  AttendanceGeneration,
  AttendanceGenerationParams,
  AttendanceInvitation,
  AttendanceInvitationParams,
  AttendanceTeam,
  AttendanceTeamParams,
  CreateAttendanceGenerationRequest,
  CreateAttendanceInvitationRequest,
  CreateAttendanceTeamRequest,
} from "./types";

export const attendanceAPI = {
  getGenerations: () =>
    api.get("/api/v1/admin/attendance/generations") as unknown as Promise<AttendanceGeneration[]>,

  createGeneration: ({ payload }: { payload: CreateAttendanceGenerationRequest }) =>
    api.post("/api/v1/admin/attendance/generations", {
      body: payload,
    }) as unknown as Promise<AttendanceGeneration>,

  deleteGeneration: ({ params }: { params: AttendanceGenerationParams }) =>
    api.delete("/api/v1/admin/attendance/generations/{generationId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  getTeams: ({ params }: { params: AttendanceGenerationParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/teams", {
      params: { path: params },
    }) as unknown as Promise<AttendanceTeam[]>,

  createTeam: ({
    params,
    payload,
  }: {
    params: AttendanceGenerationParams;
    payload: CreateAttendanceTeamRequest;
  }) =>
    api.post("/api/v1/admin/attendance/generations/{generationId}/teams", {
      params: { path: params },
      body: payload,
    }) as unknown as Promise<AttendanceTeam>,

  deleteTeam: ({ params }: { params: AttendanceTeamParams }) =>
    api.delete("/api/v1/admin/attendance/teams/{teamId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  getInvitations: ({ params }: { params: AttendanceGenerationParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/invitations", {
      params: { path: params },
    }) as unknown as Promise<AttendanceInvitation[]>,

  createInvitation: ({
    params,
    payload,
  }: {
    params: AttendanceGenerationParams;
    payload: CreateAttendanceInvitationRequest;
  }) =>
    api.post("/api/v1/admin/attendance/generations/{generationId}/invitations", {
      params: { path: params },
      body: payload,
    }) as unknown as Promise<AttendanceInvitation>,

  deleteInvitation: ({ params }: { params: AttendanceInvitationParams }) =>
    api.delete("/api/v1/admin/attendance/invitations/{invitationId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  getBoard: ({ params }: { params: AttendanceGenerationParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/board", {
      params: { path: params },
    }) as unknown as Promise<AttendanceBoard>,

  exportBoardCsv: ({ params }: { params: AttendanceGenerationParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/board/export", {
      params: { path: params },
      parseAs: "text",
    }) as unknown as Promise<string>,
};
