import type { components, paths } from "../generated/api";

export type CreateAttendanceGenerationRequest =
  components["schemas"]["CreateAttendanceGenerationRequestDto"];
export type CreateAttendanceTeamRequest = components["schemas"]["CreateAttendanceTeamRequestDto"];
export type CreateAttendanceInvitationRequest =
  components["schemas"]["CreateAttendanceInvitationRequestDto"];

export type AttendanceGenerationParams =
  paths["/api/v1/admin/attendance/generations/{generationId}"]["delete"]["parameters"]["path"];
export type AttendanceTeamParams =
  paths["/api/v1/admin/attendance/teams/{teamId}"]["delete"]["parameters"]["path"];
export type AttendanceInvitationParams =
  paths["/api/v1/admin/attendance/invitations/{invitationId}"]["delete"]["parameters"]["path"];

// BE OpenAPI에 응답 스키마가 없어 수동 정의한다.
export interface AttendanceGeneration {
  id: number;
  name: string;
  memberCount: number;
}

export interface AttendanceTeam {
  id: number;
  name: string;
  serviceName: string | null;
  memberCount: number;
}

export interface AttendanceInvitation {
  id: number;
  code: string;
  type: "MEMBER" | "MANAGER";
  description: string | null;
  registeredCount: number;
  createdAt: string;
}

export type AttendanceStatus = "ATTENDED" | "LATE" | "ABSENT" | "NONE";

export interface AttendanceBoard {
  generation: { id: number; name: string };
  today: string;
  schedules: { id: number; name: string; date: string; scheduleTime: string }[];
  members: {
    id: number;
    name: string | null;
    teamId: number | null;
    teamName: string | null;
    job: string | null;
  }[];
  cells: { memberId: number; scheduleId: number; status: AttendanceStatus }[];
  memberSummaries: { memberId: number; attended: number; late: number; absent: number }[];
  scheduleSummaries: {
    scheduleId: number;
    attended: number;
    late: number;
    absent: number;
    none: number;
  }[];
}
