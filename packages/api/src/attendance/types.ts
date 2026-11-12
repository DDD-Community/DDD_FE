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

// GET /api/v1/admin/attendance/generations/{generationId}/votes - 출석 투표 목록 조회
export type GetAttendanceVotesParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/votes"]["get"]["parameters"]["path"];
export type GetAttendanceVotesResponse =
  components["schemas"]["AttendanceVoteSummaryResponseDto"][];

// GET /api/v1/admin/attendance/votes/{voteId} - 출석 투표 상세 조회
export type GetAttendanceVoteParams =
  paths["/api/v1/admin/attendance/votes/{voteId}"]["get"]["parameters"]["path"];
export type GetAttendanceVoteResponse = components["schemas"]["AttendanceVoteDetailResponseDto"];

export interface AttendanceTeamVoteCategory {
  id: string;
  order: number;
  title: string | null;
  maxSelectableTeams: number;
  reasonRequired: boolean;
  reasonMinLength: number;
  reasonMaxLength: number;
  reasonLabel: string | null;
}

export interface AttendanceTeamVoteTemplate {
  title: string | null;
  description: string | null;
  notice: string | null;
  categories: AttendanceTeamVoteCategory[];
}

export type AttendanceFeedbackQuestionType = "MULTI_SELECT" | "LONG_TEXT" | "BOOLEAN";

export interface AttendanceFeedbackOption {
  id: string;
  label: string;
}

export interface AttendanceFeedbackQuestion {
  id: string;
  order: number;
  type: AttendanceFeedbackQuestionType;
  title: string | null;
  helpText: string | null;
  required: boolean;
  maxSelectableOptions: number | null;
  maxLength: number | null;
  options: AttendanceFeedbackOption[] | null;
  followUp: AttendanceFeedbackQuestion | null;
}

export interface AttendanceFeedbackTemplate {
  title: string | null;
  description: string | null;
  questions: AttendanceFeedbackQuestion[];
}

export type UpsertAttendanceVoteRequest = Omit<
  components["schemas"]["UpsertAttendanceVoteRequestDto"],
  "teamVoteTemplate" | "feedbackTemplate"
> & {
  teamVoteTemplate: AttendanceTeamVoteTemplate | null;
  feedbackTemplate: AttendanceFeedbackTemplate | null;
};

// POST /api/v1/admin/attendance/generations/{generationId}/votes - 출석 투표 생성
export type CreateAttendanceVoteParams =
  paths["/api/v1/admin/attendance/generations/{generationId}/votes"]["post"]["parameters"]["path"];
export type CreateAttendanceVoteResponse = AttendanceVoteDetail;

// PUT /api/v1/admin/attendance/votes/{voteId} - 작성 중 투표 수정
export type UpdateAttendanceVoteParams =
  paths["/api/v1/admin/attendance/votes/{voteId}"]["put"]["parameters"]["path"];
export type UpdateAttendanceVoteResponse = AttendanceVoteDetail;

// PUT /api/v1/admin/attendance/votes/{voteId}/text - 진행 중 투표 글자 수정
export type UpdateAttendanceVoteTextParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/text"]["put"]["parameters"]["path"];
export type UpdateAttendanceVoteTextResponse = AttendanceVoteDetail;

// DELETE /api/v1/admin/attendance/votes/{voteId} - 작성 중 투표 삭제
export type DeleteAttendanceVoteParams =
  paths["/api/v1/admin/attendance/votes/{voteId}"]["delete"]["parameters"]["path"];

// PATCH /api/v1/admin/attendance/votes/{voteId}/open - 출석 투표 시작
export type OpenAttendanceVoteParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/open"]["patch"]["parameters"]["path"];
export type OpenAttendanceVoteResponse = components["schemas"]["AttendanceVoteDetailResponseDto"];

// PATCH /api/v1/admin/attendance/votes/{voteId}/close - 출석 투표 종료
export type CloseAttendanceVoteParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/close"]["patch"]["parameters"]["path"];
export type CloseAttendanceVoteResponse = components["schemas"]["AttendanceVoteDetailResponseDto"];

// GET /api/v1/admin/attendance/votes/{voteId}/participation - 참여 현황 조회
export type GetAttendanceVoteParticipationParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/participation"]["get"]["parameters"]["path"];
export type GetAttendanceVoteParticipationResponse =
  components["schemas"]["AttendanceVoteParticipationResponseDto"];

// GET /api/v1/admin/attendance/votes/{voteId}/non-responders - 미참여 명단 조회
export type GetAttendanceVoteNonRespondersParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/non-responders"]["get"]["parameters"]["path"];
export type GetAttendanceVoteNonRespondersResponse =
  components["schemas"]["AttendanceVoteNonRespondersResponseDto"];

// GET /api/v1/admin/attendance/votes/{voteId}/team-vote/results - 팀 투표 결과 조회
export type GetAttendanceVoteTeamResultsParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/team-vote/results"]["get"]["parameters"]["path"];
export type GetAttendanceVoteTeamResultsResponse =
  components["schemas"]["AttendanceVoteTeamResultsResponseDto"];

// GET /api/v1/admin/attendance/votes/{voteId}/feedback/results - 피드백 결과 조회
export type GetAttendanceVoteFeedbackResultsParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/feedback/results"]["get"]["parameters"]["path"];
export type GetAttendanceVoteFeedbackResultsResponse =
  components["schemas"]["AttendanceVoteFeedbackResultsResponseDto"];

// GET /api/v1/admin/attendance/votes/{voteId}/export/{kind} - 출석 투표 CSV 내보내기
export type GetAttendanceVoteCsvParams =
  paths["/api/v1/admin/attendance/votes/{voteId}/export/{kind}"]["get"]["parameters"]["path"];
export type GetAttendanceVoteCsvResponse = string;

export type AttendanceVoteSummary = components["schemas"]["AttendanceVoteSummaryResponseDto"];
export type AttendanceVoteDetail = components["schemas"]["AttendanceVoteDetailResponseDto"];
export type AttendanceVoteStatus = AttendanceVoteSummary["status"];
export type AttendanceVoteExportKind = "team-vote" | "feedback" | "responses" | "non-responders";
export type AttendanceVoteParticipation =
  components["schemas"]["AttendanceVoteParticipationResponseDto"];
export type AttendanceVoteNonResponders =
  components["schemas"]["AttendanceVoteNonRespondersResponseDto"];
export type AttendanceVoteTeamResults =
  components["schemas"]["AttendanceVoteTeamResultsResponseDto"];
export type AttendanceVoteFeedbackResults =
  components["schemas"]["AttendanceVoteFeedbackResultsResponseDto"];
