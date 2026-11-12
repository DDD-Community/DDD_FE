import { api } from "../fetchClient";
import type { components } from "../generated/api";
import type {
  CreateAttendanceVoteParams,
  CreateAttendanceVoteResponse,
  DeleteAttendanceGenerationParams,
  DeleteAttendanceInvitationParams,
  DeleteAttendanceTeamParams,
  DeleteAttendanceVoteParams,
  CloseAttendanceVoteParams,
  CloseAttendanceVoteResponse,
  GetAttendanceBoardCsvParams,
  GetAttendanceBoardCsvResponse,
  GetAttendanceBoardParams,
  GetAttendanceBoardResponse,
  GetAttendanceGenerationsResponse,
  GetAttendanceInvitationsParams,
  GetAttendanceInvitationsResponse,
  GetAttendanceTeamsParams,
  GetAttendanceTeamsResponse,
  GetAttendanceVoteCsvParams,
  GetAttendanceVoteCsvResponse,
  GetAttendanceVoteFeedbackResultsParams,
  GetAttendanceVoteFeedbackResultsResponse,
  GetAttendanceVoteNonRespondersParams,
  GetAttendanceVoteNonRespondersResponse,
  GetAttendanceVoteParams,
  GetAttendanceVoteParticipationParams,
  GetAttendanceVoteParticipationResponse,
  GetAttendanceVoteResponse,
  GetAttendanceVotesParams,
  GetAttendanceVotesResponse,
  GetAttendanceVoteTeamResultsParams,
  GetAttendanceVoteTeamResultsResponse,
  OpenAttendanceVoteParams,
  OpenAttendanceVoteResponse,
  PostAttendanceGenerationRequest,
  PostAttendanceGenerationResponse,
  PostAttendanceInvitationParams,
  PostAttendanceInvitationRequest,
  PostAttendanceInvitationResponse,
  PostAttendanceTeamParams,
  PostAttendanceTeamRequest,
  PostAttendanceTeamResponse,
  UpdateAttendanceVoteParams,
  UpdateAttendanceVoteResponse,
  UpdateAttendanceVoteTextParams,
  UpdateAttendanceVoteTextResponse,
  UpsertAttendanceVoteRequest,
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

  /** 출석 투표 목록 조회 - GET /api/v1/admin/attendance/generations/{generationId}/votes */
  getVotes: ({ params }: { params: GetAttendanceVotesParams }) =>
    api.get("/api/v1/admin/attendance/generations/{generationId}/votes", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVotesResponse>,

  /** 출석 투표 상세 조회 - GET /api/v1/admin/attendance/votes/{voteId} */
  getVote: ({ params }: { params: GetAttendanceVoteParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVoteResponse>,

  /** 출석 투표 생성 - POST /api/v1/admin/attendance/generations/{generationId}/votes */
  createVote: ({
    params,
    payload,
  }: {
    params: CreateAttendanceVoteParams;
    payload: UpsertAttendanceVoteRequest;
  }) =>
    api.post("/api/v1/admin/attendance/generations/{generationId}/votes", {
      params: { path: params },
      body: payload as components["schemas"]["UpsertAttendanceVoteRequestDto"],
    }) as unknown as Promise<CreateAttendanceVoteResponse>,

  /** 작성 중 투표 수정 - PUT /api/v1/admin/attendance/votes/{voteId} */
  updateVote: ({
    params,
    payload,
  }: {
    params: UpdateAttendanceVoteParams;
    payload: UpsertAttendanceVoteRequest;
  }) =>
    api.put("/api/v1/admin/attendance/votes/{voteId}", {
      params: { path: params },
      body: payload as components["schemas"]["UpsertAttendanceVoteRequestDto"],
    }) as unknown as Promise<UpdateAttendanceVoteResponse>,

  /** 진행 중 투표 글자 수정 - PUT /api/v1/admin/attendance/votes/{voteId}/text */
  updateVoteText: ({
    params,
    payload,
  }: {
    params: UpdateAttendanceVoteTextParams;
    payload: UpsertAttendanceVoteRequest;
  }) =>
    api.put("/api/v1/admin/attendance/votes/{voteId}/text", {
      params: { path: params },
      body: payload as components["schemas"]["UpsertAttendanceVoteRequestDto"],
    }) as unknown as Promise<UpdateAttendanceVoteTextResponse>,

  /** 작성 중 투표 삭제 - DELETE /api/v1/admin/attendance/votes/{voteId} */
  deleteVote: ({ params }: { params: DeleteAttendanceVoteParams }) =>
    api.delete("/api/v1/admin/attendance/votes/{voteId}", {
      params: { path: params },
    }) as unknown as Promise<void>,

  /** 출석 투표 시작 - PATCH /api/v1/admin/attendance/votes/{voteId}/open */
  openVote: ({ params }: { params: OpenAttendanceVoteParams }) =>
    api.patch("/api/v1/admin/attendance/votes/{voteId}/open", {
      params: { path: params },
    }) as unknown as Promise<OpenAttendanceVoteResponse>,

  /** 출석 투표 종료 - PATCH /api/v1/admin/attendance/votes/{voteId}/close */
  closeVote: ({ params }: { params: CloseAttendanceVoteParams }) =>
    api.patch("/api/v1/admin/attendance/votes/{voteId}/close", {
      params: { path: params },
    }) as unknown as Promise<CloseAttendanceVoteResponse>,

  /** 출석 투표 참여 현황 조회 - GET /api/v1/admin/attendance/votes/{voteId}/participation */
  getVoteParticipation: ({ params }: { params: GetAttendanceVoteParticipationParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}/participation", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVoteParticipationResponse>,

  /** 출석 투표 미참여 명단 조회 - GET /api/v1/admin/attendance/votes/{voteId}/non-responders */
  getVoteNonResponders: ({ params }: { params: GetAttendanceVoteNonRespondersParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}/non-responders", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVoteNonRespondersResponse>,

  /** 출석 투표 팀 결과 조회 - GET /api/v1/admin/attendance/votes/{voteId}/team-vote/results */
  getVoteTeamResults: ({ params }: { params: GetAttendanceVoteTeamResultsParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}/team-vote/results", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVoteTeamResultsResponse>,

  /** 출석 투표 피드백 결과 조회 - GET /api/v1/admin/attendance/votes/{voteId}/feedback/results */
  getVoteFeedbackResults: ({ params }: { params: GetAttendanceVoteFeedbackResultsParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}/feedback/results", {
      params: { path: params },
    }) as unknown as Promise<GetAttendanceVoteFeedbackResultsResponse>,

  /** 출석 투표 CSV 내보내기 - GET /api/v1/admin/attendance/votes/{voteId}/export/{kind} */
  exportVoteCsv: ({ params }: { params: GetAttendanceVoteCsvParams }) =>
    api.get("/api/v1/admin/attendance/votes/{voteId}/export/{kind}", {
      params: { path: params },
      parseAs: "text",
    }) as unknown as Promise<GetAttendanceVoteCsvResponse>,
};
