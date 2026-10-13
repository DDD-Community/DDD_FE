import type { components, paths } from "../generated/api";

// GET /api/v1/admin/attendance/generations - 출석 기수 목록 조회
export type GetAttendanceGenerationsResponse =
  components["schemas"]["AttendanceGenerationResponseDto"][];

// POST /api/v1/admin/attendance/generations - 출석 기수 생성
export type PostAttendanceGenerationRequest =
  components["schemas"]["CreateAttendanceGenerationRequestDto"];
export type PostAttendanceGenerationResponse =
  components["schemas"]["AttendanceGenerationResponseDto"];

// DELETE /api/v1/admin/attendance/generations/{generationId} - 출석 기수 삭제
export type DeleteAttendanceGenerationParams =
  paths["/api/v1/admin/attendance/generations/{generationId}"]["delete"]["parameters"]["path"];

// GET /api/v1/admin/attendance/generations/{generationId}/teams - 출석 팀 목록 조회
export type GetAttendanceTeamsParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/teams"]["get"]["parameters"]["path"];
export type GetAttendanceTeamsResponse = components["schemas"]["AttendanceTeamResponseDto"][];

// POST /api/v1/admin/attendance/generations/{generationId}/teams - 출석 팀 생성
export type PostAttendanceTeamParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/teams"]["post"]["parameters"]["path"];
export type PostAttendanceTeamRequest = components["schemas"]["CreateAttendanceTeamRequestDto"];
export type PostAttendanceTeamResponse = components["schemas"]["AttendanceTeamResponseDto"];

// DELETE /api/v1/admin/attendance/teams/{teamId} - 출석 팀 삭제
export type DeleteAttendanceTeamParams =
  paths["/api/v1/admin/attendance/teams/{teamId}"]["delete"]["parameters"]["path"];

// GET /api/v1/admin/attendance/generations/{generationId}/invitations - 출석 초대코드 목록 조회
export type GetAttendanceInvitationsParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/invitations"]["get"]["parameters"]["path"];
export type GetAttendanceInvitationsResponse =
  components["schemas"]["AttendanceInvitationResponseDto"][];

// POST /api/v1/admin/attendance/generations/{generationId}/invitations - 출석 초대코드 생성
export type PostAttendanceInvitationParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/invitations"]["post"]["parameters"]["path"];
export type PostAttendanceInvitationRequest =
  components["schemas"]["CreateAttendanceInvitationRequestDto"];
export type PostAttendanceInvitationResponse =
  components["schemas"]["AttendanceInvitationResponseDto"];

// DELETE /api/v1/admin/attendance/invitations/{invitationId} - 출석 초대코드 삭제
export type DeleteAttendanceInvitationParams =
  paths["/api/v1/admin/attendance/invitations/{invitationId}"]["delete"]["parameters"]["path"];

// GET /api/v1/admin/attendance/generations/{generationId}/board - 출석 보드 조회
export type GetAttendanceBoardParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/board"]["get"]["parameters"]["path"];
export type GetAttendanceBoardResponse = components["schemas"]["AttendanceBoardResponseDto"];

// GET /api/v1/admin/attendance/generations/{generationId}/board/export - 출석 보드 CSV 내보내기
export type GetAttendanceBoardCsvParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/board/export"]["get"]["parameters"]["path"];
export type GetAttendanceBoardCsvResponse = string;

export type AttendanceGeneration = components["schemas"]["AttendanceGenerationResponseDto"];
export type AttendanceTeam = components["schemas"]["AttendanceTeamResponseDto"];
export type AttendanceInvitation = components["schemas"]["AttendanceInvitationResponseDto"];
export type AttendanceBoard = components["schemas"]["AttendanceBoardResponseDto"];
export type AttendanceStatus = components["schemas"]["AttendanceCellResponseDto"]["status"];
